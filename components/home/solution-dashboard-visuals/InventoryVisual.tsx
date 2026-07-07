'use client';

import { AlertTriangle, Info, Package } from 'lucide-react';
import {
  DashboardShell,
  MiniStatCard,
  PanelHeader,
  ProgressBar,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const ITEMS = [
  { name: 'Royal Canine Puppy', category: 'Food', location: 'Main Store', stock: '82 units', status: 'In Stock', tone: 'green' as const, thumb: '#F59E0B' },
  { name: 'Cat Litter Premium', category: 'Supplies', location: 'Storage A', stock: '12 units', status: 'Low Stock', tone: 'orange' as const, thumb: '#8B5CF6' },
  { name: 'Rabies Vaccine', category: 'Medication', location: 'Pharmacy', stock: '0 units', status: 'Out of Stock', tone: 'red' as const, thumb: '#EF4444' },
  { name: 'Surgical Gloves', category: 'Consumables', location: 'Surgery', stock: '240 units', status: 'In Stock', tone: 'green' as const, thumb: '#3B82F6' },
];

const LOW_STOCK = [
  { name: 'Nitrile Gloves', pct: 18 },
  { name: 'Surgical Mask', pct: 24 },
  { name: 'Cat Litter Premium', pct: 34 },
];

export default function InventoryVisual() {
  return (
    <DashboardShell className="p-2 sm:p-3">
      <div className="grid lg:grid-cols-[1fr_150px] gap-3">
        <div className="space-y-2 min-w-0">
          <PanelHeader
            title="Inventory Overview"
            actions={
              <div className="flex gap-1">
                <ToolbarButton>All Locations ▾</ToolbarButton>
                <ToolbarButton>Today 📅</ToolbarButton>
              </div>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <MiniStatCard label="Total Items" value="1,248" delta="↑ 8% vs last month" icon={Package} iconTone="purple" />
            <MiniStatCard label="In Stock" value="932" delta="↑ 12% vs last month" icon={Package} iconTone="green" />
            <MiniStatCard label="Low Stock" value="156" delta="↓ 5% vs last month" deltaTone="orange" icon={AlertTriangle} iconTone="orange" />
            <MiniStatCard label="Out of Stock" value="32" delta="↓ 3% vs last month" deltaTone="red" icon={AlertTriangle} iconTone="red" />
          </div>

          <TabBar tabs={['All Items', 'Medications', 'Consumables', 'Equipment', 'Supplies']} active="All Items" />
          <SearchRow placeholder="Search items..." />

          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.6fr_0.7fr] gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase">
              <span>Item</span>
              <span>Category</span>
              <span>Location</span>
              <span>Stock</span>
              <span>Status</span>
            </div>
            {ITEMS.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.6fr_0.7fr] gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center even:bg-white/[0.02]"
              >
                <span className="flex items-center gap-1.5 text-[#F8FAFC] truncate">
                  <span className="w-6 h-6 rounded-md shrink-0 border border-white/10" style={{ backgroundColor: `${row.thumb}33` }} />
                  {row.name}
                </span>
                <span className="text-[#94A3B8]">{row.category}</span>
                <span className="text-[#64748B]">{row.location}</span>
                <span className="text-[#94A3B8]">{row.stock}</span>
                <StatusPill label={row.status} tone={row.tone} />
              </div>
            ))}
          </div>
          <p className="text-[8px] text-[#8B5CF6] font-medium">View all items →</p>
        </div>

        <div className="space-y-2 hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[9px] font-semibold text-[#F8FAFC]">Alerts</h4>
              <span className="w-4 h-4 rounded-full bg-[#EF4444] text-[8px] text-white flex items-center justify-center font-bold">3</span>
            </div>
            <div className="space-y-1.5 text-[8px]">
              <div className="flex items-center gap-2 text-[#FCA5A5]"><AlertTriangle className="w-3 h-3" /> Out of Stock</div>
              <div className="flex items-center gap-2 text-[#FDBA74]"><AlertTriangle className="w-3 h-3" /> Low Stock</div>
              <div className="flex items-center gap-2 text-[#93C5FD]"><Info className="w-3 h-3" /> Expiring Soon</div>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Low Stock Items" />
            <div className="space-y-2">
              {LOW_STOCK.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-[8px] mb-0.5">
                    <span className="text-[#94A3B8]">{item.name}</span>
                    <span className="text-[#FDBA74]">{item.pct}%</span>
                  </div>
                  <ProgressBar pct={item.pct} tone="orange" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
