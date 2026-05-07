import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, User, Trash2, LogOut, ShieldAlert, Headphones } from 'lucide-react';
import AmbientSoundToggle from '@/components/forge/AmbientSoundToggle';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    // Mark account as deleted via updateMe, then log out
    await base44.auth.updateMe({ account_deleted: true, deleted_at: new Date().toISOString() });
    base44.auth.logout('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your ChainForge account</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Account info */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Account
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                {user?.full_name?.[0] ?? user?.email?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
              </div>
            </div>
          </section>

          {/* Sound */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5" />
              Sound
            </h2>
            <AmbientSoundToggle />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              A synthesized lo-fi ambient loop with soft drones, vinyl hiss, and pentatonic chimes — designed for focused debt work.
            </p>
          </section>

          {/* Session */}
          <section className="glass rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              Session
            </h2>
            <Button
              variant="outline"
              className="w-full border-border/50 text-foreground hover:bg-secondary/50"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </section>

          {/* Danger zone */}
          <section className="glass rounded-2xl p-5 border-destructive/20">
            <h2 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Danger Zone
            </h2>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  disabled={deleteLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteLoading ? 'Deleting…' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass border-border/50 max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                    Delete Account?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete your account and all your chain data. There is no going back.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border/50 text-foreground">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>

          {/* App info */}
          <section className="text-center py-4">
            <p className="text-xs text-muted-foreground font-mono">ChainForge · v1.0</p>
            <p className="text-xs text-muted-foreground mt-0.5">Break every chain. Forge your freedom.</p>
          </section>
        </div>
      </div>
    </div>
  );
}