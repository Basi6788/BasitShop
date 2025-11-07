import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import {
  User, Lock, ChevronRight, LogOut, Camera, Mail, Settings,
  Loader2, Edit, X, Save, Key, CornerDownLeft, Bell, ShoppingBag, MapPin, HelpCircle // Naye Icons for Menu
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
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
// Component 1: EditProfileModal (Design Updated)
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

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [isOpen, initialName, initialDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (name.length < 3) {
      toast.error("Naam kam az kam 3 characters ka hona chahiye.");
      setLoading(false);
      return;
    }
    await onSave(name, description);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300"
        >
          {/* Modal content slides up from bottom on mobile, centers on desktop */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto"
          >
            <button
                onClick={onClose}
                className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50"
                aria-label="Back"
            >
                <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
            </button>
            
            <div className="flex flex-col items-center mb-8">
                <h3 className="text-3xl font-extrabold text-white">Edit Profile</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-light text-gray-400 mb-2">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  minLength={3}
                />
              </div>
              
              {/* Other Profile Fields (Mockup ke liye Nickname, Phone, Address, Occupation) */}
              <div>
                <label className="block text-sm font-light text-gray-400 mb-2">Nickname</label>
                <input type="text" defaultValue="Jane" disabled
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-light text-gray-400 mb-2">About Me (Bio)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                  placeholder="Apne baray mein kuch likhein..."
                />
              </div>

              {/* Action Buttons (Mockup style) */}
              <div className="flex justify-between space-x-4 pt-8">
                <motion.button type="button" onClick={onClose} disabled={loading}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-1/2 py-3 bg-gray-700 text-white rounded-xl shadow-md hover:bg-gray-600 font-semibold transition duration-200"
                >
                  Discard
                </motion.button>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-1/2 py-3 bg-white text-gray-900 rounded-xl shadow-lg hover:bg-gray-200 flex items-center justify-center font-semibold transition duration-200"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-1" />} Save
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------------------------------------------------
// Component 2: ChangePasswordModal (Design Updated)
// ---------------------------------------------------
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oldPass: string, newPass: string) => Promise<boolean>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    if (newPassword.length < 6) {
      toast.error("Naya password kam az kam 6 characters ka hona chahiye.");
    } else if (newPassword !== confirmPassword) {
      toast.error("Naya password match nahi ho raha.");
    } else {
      const saveSuccessful = await onSave(oldPassword, newPassword);
      if (saveSuccessful) {
        setSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(onClose, 1800);
      }
    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-sm transition-all duration-300"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-900 text-white p-6 pt-10 sm:p-8 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl relative h-[90vh] sm:h-auto overflow-y-auto"
          >
             <button
                onClick={onClose}
                className="absolute top-4 left-4 text-gray-400 hover:text-white transition duration-200 p-2 rounded-full bg-gray-800/50"
                aria-label="Back"
            >
                <CornerDownLeft className="w-6 h-6 rotate-90 sm:rotate-0" />
            </button>
            <div className="flex flex-col items-center mb-8">
                <h3 className="text-3xl font-extrabold text-white">Change Password</h3>
            </div>

            {success && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className='p-3 bg-green-900/50 text-green-300 rounded-xl mb-6 font-semibold border border-green-700'>
                Password successfully change ho gaya!
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-light text-gray-400 mb-2">Old Password</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-light text-gray-400 mb-2">New Password (min 6)</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-light text-gray-400 mb-2">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                />
              </div>
              
              <div className="flex justify-end pt-8">
                <motion.button type="submit" disabled={loading || success}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 flex items-center justify-center font-semibold transition duration-200"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Key className="w-5 h-5 mr-1" />} Change Password
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// ---------------------------------------------------
// Main Profile Page Component (Design Updated)
// ---------------------------------------------------
export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userName, userId, logoutUser, profilePic, updateProfilePic } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const authToken = localStorage.getItem('authToken');
  const [authChecked, setAuthChecked] = useState(false);

  // Defensive guard wrapper - ensures actions require login
  const requireAuth = (action?: () => void) => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return false;
    }
    if (action) action();
    return true;
  };

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!authToken || !userId) {
      setProfile(null);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/profile`, {
        headers: { 'x-auth-token': authToken },
        timeout: 15000
      });

      const data: UserProfile = response.data;
      setProfile(data);

      localStorage.setItem('userName', data.name);
      if (data.profilePicBase64) localStorage.setItem('profilePicBase64', data.profilePicBase64);
      updateProfilePic(data.profilePicBase64);
    } catch (error: any) {
      console.error("Profile fetch error:", error?.response?.data || error);
      toast.error("Profile data load nahi ho saka. Server Error.");
    } finally {
      setLoading(false);
    }
  }, [authToken, userId, updateProfilePic]);

  // If user not logged in, redirect to login (defensive)
  useEffect(() => {
    if (!isLoggedIn) {
      setAuthChecked(true);
      navigate('/login', { replace: true });
      return;
    } else {
      setAuthChecked(true);
      fetchProfile();
    }
  }, [isLoggedIn, navigate, fetchProfile]);

  // Update profile (PUT)
  const handleUpdateProfile = async (newName: string, newDescription: string) => {
    if (!authToken) {
      toast.error("Not authenticated.");
      navigate('/login', { replace: true });
      return;
    }
    try {
      const response = await axios.put(`${BASE_URL}/api/profile`, {
        name: newName, description: newDescription
      }, {
        headers: { 'x-auth-token': authToken },
        timeout: 15000
      });

      if (response.data.message) {
        toast.success(response.data.message);
        localStorage.setItem('userName', newName);
        setIsEditingProfile(false); // Close modal on success
        fetchProfile();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Profile update mein ghalti hui.");
    }
  };

  // Change password
  const handleChangePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!authToken) {
      toast.error("Not authenticated.");
      navigate('/login', { replace: true });
      return false;
    }
    try {
      const response = await axios.put(`${BASE_URL}/api/profile/change-password`, {
        oldPassword: oldPass, newPassword: newPass
      }, {
        headers: { 'x-auth-token': authToken },
        timeout: 15000
      });

      toast.success(response.data.message);
      return true;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Password change nahi ho saka. Old password check karein.");
      return false;
    }
  };

  // Profile picture upload - guarded
  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!requireAuth()) return;
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
      const oldPic = profilePic;
      updateProfilePic(base64String); // optimistic

      try {
        const response = await axios.post(`${BASE_URL}/api/profile/upload-pic`, {
          profilePicBase64: base64String
        }, {
          headers: { 'x-auth-token': authToken },
          timeout: 30000
        });

        if (response.data.success) {
          toast.success("Profile picture update ho gaya!");
          fetchProfile();
        } else {
          updateProfilePic(oldPic);
          toast.error(response.data.message || "Picture upload mein ghalti hui.");
        }
      } catch (error) {
        updateProfilePic(oldPic);
        console.error("Profile picture upload error:", error);
        toast.error("Picture upload nahi ho saka. Server error ya network issue.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  // Render loader while auth checked or initial fetch
  if (!authChecked || (loading && !profile)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  // Fallback profile
  const currentProfile: UserProfile = profile || {
    id: userId || 'N/A',
    name: userName || 'User',
    email: 'user@example.com',
    role: 'user',
    description: 'Koi description nahi diya gaya.',
    profilePicBase64: profilePic,
  };
  
  // Menu items (Mimicking the image's list structure)
  const menuItems = [
    { icon: Edit, label: 'Edit Profile', action: () => requireAuth(() => setIsEditingProfile(true)), color: 'text-white' },
    { icon: Lock, label: 'Change Password', action: () => requireAuth(() => setIsChangingPassword(true)), color: 'text-white' },
    { icon: MapPin, label: 'Address Management', action: () => toast.info('Address Management is coming soon!'), color: 'text-white' },
    { icon: HelpCircle, label: 'Help & Support', action: () => toast.info('Need help? Contact support!'), color: 'text-white' },
    { icon: Settings, label: 'Setting', action: () => toast.info('General settings coming soon!'), color: 'text-white' },
  ];
  
  // Quick Access Buttons (Mimicking the image's Notification, Voucher, History)
  const quickAccessButtons = [
    { icon: Bell, label: 'Notification', action: () => toast.info('Notifications feature coming soon.') },
    { icon: ShoppingBag, label: 'Voucher', action: () => toast.info('Vouchers coming soon.') },
    { icon: CornerDownLeft, label: 'History', action: () => toast.info('History feature coming soon.') },
  ];

  // Common animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    }),
    hover: { scale: 1.02, backgroundColor: 'rgba(55, 65, 81, 0.4)', transition: { duration: 0.2 } }
  };
  
  const buttonVariants = {
    initial: { scale: 1, opacity: 1 },
    hover: { scale: 1.05, y: -2, boxShadow: '0 8px 15px rgba(0, 0, 0, 0.5)' },
    tap: { scale: 0.95 }
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white transition-all duration-300 p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto min-h-screen bg-gray-900 shadow-2xl"
      >
        
        {/* Header Section (Profile Title + Back Button) */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 p-4 pt-10 flex justify-between items-center border-b border-gray-800">
            <motion.button
                onClick={() => navigate(-1)}
                className="text-white hover:text-gray-300 transition duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <CornerDownLeft className="w-6 h-6 rotate-90" />
            </motion.button>
            <h1 className="text-2xl font-bold">Profile</h1>
            <div className="w-6"></div> {/* Placeholder for alignment */}
        </div>

        {/* User Info Card */}
        <div className="p-6 pt-8 flex flex-col items-center">
          <div className="relative mb-4">
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              src={currentProfile.profilePicBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.name || 'User')}&background=1f2937&color=fff&size=96&rounded=true`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-600 shadow-xl"
            />
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login', { replace: true });
                  return;
                }
                fileInputRef.current?.click();
              }}
              className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
              aria-label="Change profile picture"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
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
          <h2 className="text-2xl font-bold text-white mt-2">
            {currentProfile.name || 'Jane Cooper'}
          </h2>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <Mail className='w-3 h-3' /> {currentProfile.email.split('@')[0]}@gmail.com
          </p>
        </div>
        
        {/* Quick Access Buttons */}
        <div className="flex justify-around items-center p-4">
            {quickAccessButtons.map((btn, index) => (
                <motion.button
                    key={index}
                    onClick={btn.action}
                    className="flex flex-col items-center text-xs text-gray-400 w-1/4"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="p-3 bg-gray-800 rounded-xl mb-1 shadow-md">
                        <btn.icon className="w-5 h-5 text-white" />
                    </div>
                    {btn.label}
                </motion.button>
            ))}
        </div>
        
        {/* Settings Menu List */}
        <div className="mt-4 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-xl transition-all duration-200 text-left border border-gray-700/50"
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <div className="flex items-center">
                <item.icon className={`w-5 h-5 mr-4 ${item.color}`} />
                <span className="text-white font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))}
          
          {/* Logout Button (Separate style as per image's last item) */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#b91c1c' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => requireAuth(logoutUser)}
            className="w-full flex items-center justify-center p-4 bg-gray-800 text-red-500 rounded-xl shadow-lg mt-6 border border-gray-700/50 transition-all duration-200"
            custom={menuItems.length}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-semibold text-lg">Log out</span>
          </motion.button>
        </div>
        
        {/* Bottom padding for better mobile view */}
        <div className="h-20"></div>

      </motion.div>

      {/* Modals - using updated dark theme style */}
      <EditProfileModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        initialName={currentProfile.name}
        initialDescription={currentProfile.description}
        onSave={handleUpdateProfile}
      />
      <ChangePasswordModal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        onSave={handleChangePassword}
      />
    </div>
  );
};

