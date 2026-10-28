import React from 'react';
import { Link } from 'react-router-dom';

interface UserItem {
  id: string;
  name_bn: string;
  name_en: string;
  username: string;
  email: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
}

interface TableProps {
  users: UserItem[];
  meta?: {
    page: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (newPage: number) => void;
}

export const UsersTable: React.FC<TableProps> = ({ users, meta, onPageChange }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Active</span>;
      case 'INVITED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Invited</span>;
      case 'DISABLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Disabled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
        {role === 'OFFICE_STAFF' ? 'Office Staff' : role === 'ACCOUNTS' ? 'Accounts' : 'Admin'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">User</th>
              <th className="px-6 py-3.5">Username</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Last Login (BDT)</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No users found matching criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{u.name_en}</div>
                    <div className="text-xs text-slate-400">{u.email || u.name_bn}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">{u.username}</td>
                  <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                  <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/app/admin/users/${u.id}`}
                      className="text-xs font-semibold text-[#137C73] hover:underline"
                    >
                      View / Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {meta && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing page {meta.page} of {meta.total_pages} ({meta.total} total users)
          </div>
          <div className="flex space-x-1">
            <button
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              ◀
            </button>
            <button
              disabled={meta.page >= meta.total_pages}
              onClick={() => onPageChange(meta.page + 1)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

