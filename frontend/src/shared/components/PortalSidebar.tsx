import type {
  LucideIcon,
} from 'lucide-react';

import {
  Activity,
  ChevronRight,
} from 'lucide-react';

import type {
  User,
} from '../types';

import '../../styles/portal-layouts.css';

export interface PortalSidebarItem<
  Page extends string,
> {
  id: Page;
  label: string;
  description: string;
  icon: LucideIcon;
}

type PortalVariant =
  | 'admin'
  | 'doctor'
  | 'patient';

interface Props<
  Page extends string,
> {
  user: User;
  title: string;
  eyebrow: string;
  roleLabel: string;
  currentPage: Page;
  items: PortalSidebarItem<Page>[];
  variant: PortalVariant;
  onNavigate: (page: Page) => void;
}

function getInitials(
  name: string,
): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join('');

  return initials || 'SP';
}

function PortalSidebar<
  Page extends string,
>({
  user,
  title,
  eyebrow,
  roleLabel,
  currentPage,
  items,
  variant,
  onNavigate,
}: Props<Page>) {
  return (
    <aside
      className={[
        'sidebar',
        'portal-sidebar',
        `portal-sidebar--${variant}`,
      ].join(' ')}
    >
      <div className="portal-sidebar-brand">
        <div className="portal-sidebar-logo">
          <img
            src="/assets/logo/smartpharmacy-logo.png"
            alt="SmartPharmacy"
          />
        </div>

        <div className="portal-sidebar-brand-copy">
          <span>{eyebrow}</span>

          <h2>{title}</h2>
        </div>
      </div>

      <div className="portal-sidebar-divider" />

      <span className="portal-sidebar-section-title">
        Panel principal
      </span>

      <nav className="portal-sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            currentPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={
                isActive
                  ? 'active'
                  : ''
              }
              onClick={() =>
                onNavigate(item.id)
              }
            >
              <span className="portal-sidebar-nav-icon">
                <Icon size={20} />
              </span>

              <span className="portal-sidebar-nav-copy">
                <strong>
                  {item.label}
                </strong>

                <small>
                  {item.description}
                </small>
              </span>

              <ChevronRight
                className="portal-sidebar-nav-arrow"
                size={17}
              />
            </button>
          );
        })}
      </nav>

      <div className="portal-sidebar-spacer" />

      <div className="portal-sidebar-status">
        <span className="portal-sidebar-status-icon">
          <Activity size={19} />
        </span>

        <div>
          <strong>
            Sistema operativo
          </strong>

          <span>
            <i />
            Servicios disponibles
          </span>
        </div>
      </div>

      <div className="portal-sidebar-user">
        <div className="portal-sidebar-user-avatar">
          {getInitials(user.name)}
        </div>

        <div className="portal-sidebar-user-copy">
          <strong>
            {user.name}
          </strong>

          <span>
            {roleLabel}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default PortalSidebar;