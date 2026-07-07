'use client';

import { AlertTriangle, Info, Package } from 'lucide-react';
import type { SolutionProductKey } from '@/lib/solution-mockup-assets';
import { cn } from '@/lib/utils';
import {
  CategoryPill,
  DashboardShell,
  MiniStatCard,
  PanelHeader,
  ProductThumb,
  ProgressBar,
  SearchRow,
  StatusPill,
  TabBar,
  ToolbarButton,
} from './shared';

const ITEMS: {
  name: string;
  category: string;
  categoryTone: 'purple' | 'blue' | 'orange' | 'green';
  location: string;
  stock: string;
  status: string;
  tone: 'green' | 'orange' | 'red';
  product: SolutionProductKey;
}[] = [
  { name: 'Amoxicillin 500mg', category: 'Medication', categoryTone: 'purple', location: 'Pharmacy', stock: '142 units', status: 'In Stock', tone: 'green', product: 'amoxicillin' },
  { name: 'Syringe 5ml', category: 'Consumable', categoryTone: 'blue', location: 'Surgery', stock: '320 units', status: 'In Stock', tone: 'green', product: 'syringe' },
  { name: 'Nitrile Gloves', category: 'Consumable', categoryTone: 'blue', location: 'Main Store', stock: '28 boxes', status: 'Low Stock', tone: 'orange', product: 'gloves' },
  { name: 'Vacutainer Tubes', category: 'Supply', categoryTone: 'orange', location: 'Lab', stock: '86 units', status: 'In Stock', tone: 'green', product: 'vacutainer' },
  { name: 'Glucometer Strips', category: 'Supply', categoryTone: 'orange', location: 'Pharmacy', stock: '54 packs', status: 'In Stock', tone: 'green', product: 'strips' },
];

const ALERTS = [
  { type: 'Out of Stock', branch: 'Downtown Branch', tone: 'text-[#FCA5A5]' },
  { type: 'Low Stock', branch: 'Main Clinic', tone: 'text-[#FDBA74]' },
  { type: 'Expiring Soon', branch: 'North Branch', tone: 'text-[#93C5FD]' },
];

const LOW_STOCK = [
  { name: 'Nitrile Gloves', label: '28 boxes left', pct: 18 },
  { name: 'Surgical Mask', label: '42 boxes left', pct: 24 },
  { name: 'Rabies Vaccine', label: '6 vials left', pct: 34 },
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
                  <ProductThumb product={row.product} />
                  {row.name}
                </span>
                <CategoryPill label={row.category} tone={row.categoryTone} />
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
            <div className="space-y-2 text-[8px]">
              {ALERTS.map((alert) => (
                <div key={alert.branch} className="space-y-0.5">
                  <div className={cn('flex items-center gap-2', alert.tone)}>
                    {alert.type === 'Expiring Soon' ? <Info className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {alert.type}
                  </div>
                  <p className="text-[#64748B] pl-5">{alert.branch}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
            <PanelHeader title="Low Stock Items" />
            <div className="space-y-2">
              {LOW_STOCK.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-[8px] mb-0.5">
                    <span className="text-[#94A3B8]">{item.name}</span>
                    <span className="text-[#FDBA74]">{item.label}</span>
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
