// Path: /src/pages/ProfilePage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import {
  User, Lock, ChevronRight, LogOut, Camera, Star, Wallet, FileText, Settings,
  Loader2, ShoppingBag, MapPin, Mail, ImagePlus // Zaroori Icons
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// Agar aapne install kiya hai: npm install react-hot-toast
import toast from 'react-hot-toast'; 

// Backend API URL
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://romeo-backend.vercel.app'; 

// --- Interfaces for Profile Data ---
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    description: string;
    profilePicBase64: string | null;
}

// ---------------------------------------------------
// 🛑 Component 1: EditProfileModal
// ---------------------------------------------------
interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialName: string;
    initialDescription: string;
    onSave: (name: string, description: string) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, initialName, initialDescription, onSave }) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormFormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (name.length < 3) {
            toast.error("Naam kam az kam 3 characters ka hona chahiye.");
            setLoading(false);
            return;
        }
        await onSave(name, description);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 50 }} 
                animate={{ scale: 1, y: 0 }} 
                className="bg-white dark:bg-gray-700 p-6 rounded-xl w-full max-w-md shadow-2xl relative"
            >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2">My Profile (Update)</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required 
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            minLength={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Me (Description)</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} 
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                            placeholder="Apne baray mein kuch likhein..."
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// ---------------------------------------------------
// 🛑 Component 2: ChangePasswordModal
// ---------------------------------------------------
interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (oldPass: string, newPass: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if(success) {
            setTimeout(onClose, 2000); // Success hone par 2 sec baad band karein
        }
    }, [success, onClose]);

    const handleSubmit = async (e: React.FormFormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        if (newPassword.length < 6) {
            toast.error("Naya password kam az kam 6 characters ka hona chahiye.");
        } else if (newPassword !== confirmPassword) {
            toast.error("Naya password match nahi ho raha.");
        } else {
            const saveSuccessful = await onSave(oldPassword, newPassword);
            if(saveSuccessful) {
                setSuccess(true);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        }
        
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 50 }} 
                animate={{ scale: 1, y: 0 }} 
                className="bg-white dark:bg-gray-700 p-6 rounded-xl w-full max-w-md shadow-2xl relative"
            >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2">Change Password</h3>
                {success && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className='p-3 bg-green-100 text-green-700 rounded-lg mb-4 font-semibold'>Password successfully change ho gaya!</motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Password</label>
                        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required 
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (min 6)</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={loading || success}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || success}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Change Password'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// ---------------------------------------------------
// 🛑 Main Profile Page Component (Integration)
// ---------------------------------------------------

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  // AuthContext se zaroori data aur functions liye
  const { isLoggedIn, userName, userId, logoutUser, profilePic, updateProfilePic } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false); 
  const [isChangingPassword, setIsChangingPassword] = useState(false); 

  const authToken = localStorage.getItem('authToken');

  // 1. Data Fetching (GET /api/profile)
  const fetchProfile = useCallback(async () => {
    if (!authToken || !userId) return;
    setLoading(true);
    try {
        const response = await axios.get(`${BASE_URL}/api/profile`, { 
            headers: { 'x-auth-token': authToken }
        });

        const data: UserProfile = response.data;
        setProfile(data);
        
        // Context aur LocalStorage ko latest data (name aur pic) se update karein
        localStorage.setItem('userName', data.name);
        if (data.profilePicBase64) localStorage.setItem('profilePicBase64', data.profilePicBase64);
        updateProfilePic(data.profilePicBase64); 

    } catch (error) {
        console.error("Profile fetch error:", error?.response?.data || error);
        toast.error("Profile data load nahi ho saka. Server Error.");
    } finally {
        setLoading(false);
    }
  }, [authToken, userId, updateProfilePic]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    } else {
        fetchProfile();
    }
  }, [isLoggedIn, navigate, fetchProfile]);

  // 2. API Call Handlers

  // PUT /api/profile
  const handleUpdateProfile = async (newName: string, newDescription: string) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/profile`, { 
            name: newName, description: newDescription 
        }, {
            headers: { 'x-auth-token': authToken }
        });
        
        if (response.data.message) {
            toast.success(response.data.message);
            localStorage.setItem('userName', newName); // LocalStorage/Context update
            fetchProfile(); // Refresh latest data
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || "Profile update mein ghalti hui.");
    }
  };

  // PUT /api/profile/change-password
  const handleChangePassword = async (oldPass: string, newPass: string) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/profile/change-password`, { 
            oldPassword: oldPass, newPassword: newPass
        }, {
            headers: { 'x-auth-token': authToken }
        });
        
        toast.success(response.data.message);
        return true; // Success
    } catch (error) {
        toast.error(error?.response?.data?.message || "Password change nahi ho saka. Old password check karein.");
        return false; // Failure
    }
  };

  // POST /api/profile/upload-pic
  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { 
      toast.error("Image ka size 2MB se kam hona chahiye.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string; 
      updateProfilePic(base64String); // Instant UI update

      try {
        const response = await axios.post(`${BASE_URL}/api/profile/upload-pic`, { 
            profilePicBase64: base64String 
        }, {
            headers: { 'x-auth-token': authToken },
            timeout: 10000 
        });

        if (response.data.success) {
            toast.success("Profile picture update ho gaya!");
        } else {
            toast.error(response.data.message || "Picture upload mein ghalti hui.");
        }
      } catch (error) {
        console.error("Profile picture upload error:", error);
        toast.error("Picture upload nahi ho saka. Server error ya network issue.");
      } finally {
        setLoading(false);
        fileInputRef.current!.value = ""; // Input ko reset karein
      }
    };
    reader.readAsDataURL(file); 
  };
  
  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  // Fallback for profile data if fetch fails
  const currentProfile: UserProfile = profile || {
    id: userId || 'N/A',
    name: userName || 'Guest',
    email: 'N/A',
    role: 'user',
    description: 'Koi description nahi diya gaya.',
    profilePicBase64: profilePic,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 transition-all duration-300 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <img
              src={currentProfile.profilePicBase64 || `https://ui-avatars.com/api/?name=${currentProfile.name || 'User'}&background=random&color=fff&size=128&rounded=true`}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
              aria-label="Change profile picture"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleProfilePicChange}
              style={{ display: 'none' }}
              disabled={loading}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Welcome, {currentProfile.name || 'User'}! 
            <span className="text-yellow-400 text-2xl">✨</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xs italic">
            {currentProfile.description || "No bio yet."}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full mt-2 font-medium">
            <Star className="inline w-4 h-4 mr-1 text-yellow-500" /> {currentProfile.role.toUpperCase()}
          </p>
        </div>

        {/* Account Overview (Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl flex flex-col items-center justify-center">
                <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                <span className="text-indigo-800 dark:text-indigo-200 font-semibold text-sm">Email</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-300 line-clamp-1">{currentProfile.email}</span>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl flex flex-col items-center justify-center">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                <span className="text-red-800 dark:text-red-200 font-semibold text-sm">Pending Reviews</span>
                <span className="text-xs text-red-600 dark:text-red-300">3</span>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl flex flex-col items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <span className="text-green-800 dark:text-green-200 font-semibold text-sm">Wallet Balance</span>
                <span className="text-xs text-green-600 dark:text-green-300">1,250 pts</span>
            </div>
        </div>

        {/* Account Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-500 dark:text-gray-400" /> Account Settings
          </h2>

          {/* My Profile (Edit Details) */}
          <button
            onClick={() => setIsEditingProfile(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl shadow-sm transition-all duration-200"
          >
            <div className="flex items-center">
              <User className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400" />
              <span className="text-gray-800 dark:text-white font-medium">My Profile (Edit Name/Bio)</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Change Password */}
          <button
            onClick={() => setIsChangingPassword(true)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl shadow-sm transition-all duration-200"
          >
            <div className="flex items-center">
              <Lock className="w-5 h-5 mr-3 text-purple-500 dark:text-purple-400" />
              <span className="text-gray-800 dark:text-white font-medium">Change Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
            
          {/* View Order History */}
          <button
            onClick={() => navigate('/user/orders')} 
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl shadow-sm transition-all duration-200"
          >
            <div className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-3 text-orange-500 dark:text-orange-400" />
              <span className="text-gray-800 dark:text-white font-medium">View Order History</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          {/* Saved Addresses (Placeholder) */}
           <button
            onClick={() => toast.info('Addresses feature is coming soon!')} 
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl shadow-sm transition-all duration-200"
          >
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-cyan-500 dark:text-cyan-400" />
              <span className="text-gray-800 dark:text-white font-medium">Saved Addresses</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>


          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={logoutUser}
            className="w-full flex items-center justify-center p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg mt-6 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-semibold text-lg">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {isEditingProfile && (
            <EditProfileModal
                isOpen={isEditingProfile}
                onClose={() => setIsEditingProfile(false)}
                initialName={currentProfile.name}
                initialDescription={currentProfile.description}
                onSave={handleUpdateProfile}
            />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isChangingPassword && (
            <ChangePasswordModal
                isOpen={isChangingPassword}
                onClose={() => setIsChangingPassword(false)}
                onSave={handleChangePassword}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

