"use client";
export const dynamic = "force-dynamic";

import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTheme } from "../context/themeprovider";


export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  

  const [editMode, setEditMode] = useState(false);
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/users/user');
        setUser(res.data.data);
        setUpdatedUsername(res.data.data.username);
        setUpdatedEmail(res.data.data.email);
        setPreviewImage(res.data.data.profileImage || null);
      } catch {
        toast.error("Unauthorized. Redirecting...");
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axios.get('/api/users/logout');
      toast.success('Logged out');
      router.push('/login');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.patch('/api/users/updatedetails', {
        username: updatedUsername,
        email: updatedEmail,
        profileImage: previewImage ?? user?.profileImage, 
      });
      setUser(res.data.data);
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  

  const handlePasswordReset = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (oldPassword === newPassword) {
      toast.error("New password cannot be the same as the old password.");
      return;
    }
    
    try {
      toast.loading("Updating password...");
      const res = await axios.patch("/api/users/resetpassword", {
        oldPassword,
        newPassword,
      });
      toast.dismiss();
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.error|| "Password update failed.");
    }
  };

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const CLOUD_NAME = 'dp46e5w7r';
    const UPLOAD_PRESET = 'profilepicture';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      toast.loading("Uploading...");
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      setPreviewImage(res.data.secure_url);
      toast.dismiss();
      toast.success("Image updated!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow">
        <h1 className="text-xl font-bold text-indigo-600 font-mono">MyApp | Profile</h1>
        <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={!darkMode}
      onChange={() => toggleDarkMode(!darkMode)}
    />
    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer dark:bg-gray-600 peer-checked:bg-indigo-500 transition-all"></div>
    <div className="absolute left-1 top-2 bg-none w-2 h-2  transition-all peer-checked:translate-x-5 flex items-center justify-cente">
      {darkMode ? "🌙" : "☀️"}
    </div>
  </label>
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex justify-center py-10 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className= {` ${!editMode ? 'max-h-[400px] w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6' : 'w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6'}`}>
          {loading ? (
            <p className="text-center text-sm text-gray-500">Loading profile...</p>
          ) : (
            <>
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                {previewImage ? (
                  <img src={previewImage || user?.profileImage || "/default-avatar.png"} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
                
              </div>

              {/* Info / Edit */}
              {editMode ? (
                
                <div className="space-y-4 text-sm font-mono text-gray-900 dark:text-white">
                    <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full mt-2 text-sm text-center text-gray-900 dark:text-white file:cursor-pointer file:rounded file:border-0 file:bg-gray-200 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-300 dark:file:bg-gray-700 dark:file:text-white dark:hover:file:bg-gray-600"
                />
                  <div>
                    <label>Username</label>
                    <input
                      type="text"
                      value={updatedUsername}
                      onChange={(e) => setUpdatedUsername(e.target.value)}
                      className="w-full p-2 rounded border dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      value={updatedEmail}
                      onChange={(e) => setUpdatedEmail(e.target.value)}
                      className="w-full p-2 rounded border dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">Change Password</h2>
                    <input
                      type="password"
                      placeholder="Old Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full mb-2 p-2 rounded border dark:bg-gray-700"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full mb-2 p-2 rounded border dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      placeholder="Confirm New Password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full mb-2 p-2 rounded border dark:bg-gray-700"
                    />
                    <button
                      onClick={handlePasswordReset}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2"
                    >
                      Update Password
                    </button>
                  </div>
                  <button
                    onClick={handleUpdateProfile}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-sm font-mono space-y-2 text-gray-900 dark:text-white">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded "
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 bg-gray-200 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </footer>

      {/* Logout Confirm Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
