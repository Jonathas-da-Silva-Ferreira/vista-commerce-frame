import AdminLayout from '@/components/admin/AdminLayout';
import { Construction } from 'lucide-react';

interface AdminPlaceholderPageProps {
  title: string;
}

/**
 * Single component reused by all Phase-2 admin sections (categories,
 * banners, orders, users, sellers). Keeping a uniform "coming soon" surface
 * means the sidebar stays navigable while the underlying CRUD is built.
 */
export default function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto text-center py-16 space-y-3">
        <Construction className="w-10 h-10 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm">
          This management area is scaffolded and the database tables, RLS policies and
          permissions are already in place. The UI for this section ships in the next
          phase to keep the current change focused and reviewable.
        </p>
      </div>
    </AdminLayout>
  );
}
