"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, UploadCloud, Save } from 'lucide-react';
import { addProduct } from '@/lib/api';
import { useAuth } from '@/lib/auth';
// Removed firebase storage imports since we are using Cloudinary now

export default function AddProduct() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic image compression using canvas to speed up upload
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            setImageFile(compressedFile);
            setImagePreview(URL.createObjectURL(compressedFile));
          }, 'image/jpeg', 0.7); // 70% quality
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in as a vendor to add products.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Helper function to timeout promises that hang indefinitely
    const withTimeout = (promise, ms, message) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
      ]);
    };

    try {
      if (!imageFile) {
        throw new Error("Please select an image for your product.");
      }

      let imageUrl = '';

      console.log("Starting image upload to Cloudinary...");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("ERROR: Missing Cloudinary environment variables. Please restart your Next.js server!");
      }

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'vendora/products'); // Organizes images into a specific folder in Cloudinary

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const uploadData = await uploadResponse.json();
      imageUrl = uploadData.secure_url;
      console.log("Image uploaded successfully to Cloudinary:", imageUrl);

      console.log("Saving product to Firestore...");
      // 2. Save Product to Firestore
      await withTimeout(
        addProduct({
          title,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          category,
          image: imageUrl,
          vendorId: user.uid,
          vendorName: user.name,
          rating: 0,
          reviews: 0
        }),
        10000,
        "Firestore Save Timeout: Please ensure Firestore Database is enabled in your Firebase Console."
      );

      console.log("Product saved successfully! Redirecting...");
      setIsSubmitting(false);
      router.push('/vendor/products');
    } catch (err) {
      console.error("Save Error:", err);
      setError(err.message || "Failed to add product. Please check console.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-4 relative z-10">
      <Link href="/vendor/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
          <p className="text-slate-400">List a new item in your store.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/50"
              >
                <h2 className="text-xl font-bold mb-6">General Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Quantum Core Reactor"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product..."
                      rows="5"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    ></textarea>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/50"
              >
                <h2 className="text-xl font-bold mb-6">Pricing & Inventory</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/50"
              >
                <h2 className="text-xl font-bold mb-6">Organization</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option>Electronics</option>
                      <option>Cyber-Wear</option>
                      <option>Gaming</option>
                      <option>Power</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 md:p-8 rounded-3xl border border-slate-700/50 relative overflow-hidden"
              >
                <h2 className="text-xl font-bold mb-6">Media</h2>

                <label className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-800/50 transition-colors cursor-pointer group block relative">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />

                  {imagePreview ? (
                    <div className="absolute inset-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium text-sm bg-black/70 px-3 py-1 rounded-full">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-white mb-1">Click to upload image</p>
                      <p className="text-xs text-slate-400">JPG, PNG, WEBP (max. 5MB)</p>
                    </>
                  )}
                </label>
              </motion.div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Link href="/vendor/products" className="px-6 py-3 rounded-xl border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
