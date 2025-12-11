// src/pages/Profile.jsx
import { useAuth } from "../context/authContext";
import { User, Mail, Calendar, Edit } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-4">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Email Address</h3>
              </div>
              <p>{user?.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Member Since</h3>
              </div>
              <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Account Type</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
                <button className="flex items-center gap-2 px-3 py-1 rounded-lg glass hover:bg-primary/10 transition-colors text-sm">
                  <Edit className="h-3 w-3" />
                  Upgrade
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50">
            <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="px-4 py-3 rounded-lg glass hover:bg-primary/10 transition-colors text-left">
                Change Password
              </button>
              <button className="px-4 py-3 rounded-lg glass hover:bg-blue-500/10 text-blue-500 transition-colors text-left">
                Edit Profile
              </button>
              <button className="px-4 py-3 rounded-lg glass hover:bg-red-500/10 text-red-500 transition-colors text-left">
                Delete Account
              </button>
              <button className="px-4 py-3 rounded-lg glass hover:bg-purple-500/10 text-purple-500 transition-colors text-left">
                Notification Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;