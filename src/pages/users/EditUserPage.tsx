import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import { UserProfileEditCard } from './components/edit/UserProfileEditCard';
import { UserRoleEditCard } from './components/edit/UserRoleEditCard';
import { UserStatusCard } from './components/edit/UserStatusCard';
import { ReissueModal } from './components/edit/ReissueModal';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reissueData, setReissueData] = useState<{ activation_url: string; expires_at: string } | null>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch target user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/admin/users/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });

  // Mutation: Update profile
  const profileMutation = useMutation({
    mutationFn: async (payload: { name_bn: string; name_en: string; email?: string; phone?: string }) => {
      const res = await apiClient.patch(`/api/v1/admin/users/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showNotice('success', t('profile_updated'));
    },
    onError: (err: any) => {
      showNotice('error', err.response?.data?.message || 'Failed to update user profile.');
    },
  });

  // Mutation: Update roles
  const rolesMutation = useMutation({
    mutationFn: async (roles: string[]) => {
      const res = await apiClient.put(`/api/v1/admin/users/${id}/roles`, { roles });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showNotice('success', t('roles_updated'));
    },
    onError: (err: any) => {
      showNotice('error', err.response?.data?.message || 'Failed to update roles.');
    },
  });

  // Mutation: Update status
  const statusMutation = useMutation({
    mutationFn: async ({ status, reason }: { status: 'ACTIVE' | 'DISABLED'; reason?: string }) => {
      const res = await apiClient.patch(`/api/v1/admin/users/${id}/status`, { status, reason });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showNotice('success', t('status_updated'));
    },
    onError: (err: any) => {
      showNotice('error', err.response?.data?.message || 'Failed to change account status.');
    },
  });

  // Mutation: Reissue invitation
  const reissueMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/api/v1/admin/users/${id}/invitations`);
      return res.data.data;
    },
    onSuccess: (data) => {
      setReissueData(data);
      showNotice('success', t('invitation_reissued'));
    },
    onError: (err: any) => {
      showNotice('error', err.response?.data?.message || 'Failed to reissue invitation.');
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        Loading user details...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link to="/app/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('back_to_users')}
        </Link>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
          User record not found or inaccessible.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/admin/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('back_to_users')}
        </Link>
        <div className="text-xs text-slate-400 font-mono">ID: {user.id}</div>
      </div>

      {/* Header title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name_en} ({user.name_bn})</h2>
        <p className="text-xs text-slate-500 mt-1">
          Username: <span className="font-mono text-slate-700 font-semibold">{user.username}</span> · Role: <span className="font-semibold text-[#137C73]">{user.role}</span>
        </p>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Modular Section 1: Profile & Contact */}
      <UserProfileEditCard
        user={user}
        onSubmit={async (data) => {
          await profileMutation.mutateAsync(data);
        }}
        isSubmitting={profileMutation.isPending}
      />

      {/* Modular Section 2: Role Management */}
      <UserRoleEditCard
        currentRoles={user.roles || [user.role]}
        onSubmit={async (roles) => {
          await rolesMutation.mutateAsync(roles);
        }}
        isSubmitting={rolesMutation.isPending}
      />

      {/* Modular Section 3: Status & Lifecycle */}
      <UserStatusCard
        status={user.status}
        onUpdateStatus={async (status, reason) => {
          await statusMutation.mutateAsync({ status, reason });
        }}
        onReissueInvitation={async () => {
          await reissueMutation.mutateAsync();
        }}
        isSubmitting={statusMutation.isPending || reissueMutation.isPending}
      />

      {/* Reissue Invitation Modal */}
      {reissueData && (
        <ReissueModal
          activationUrl={reissueData.activation_url}
          expiresAt={reissueData.expires_at}
          onClose={() => setReissueData(null)}
        />
      )}
    </div>
  );
};
