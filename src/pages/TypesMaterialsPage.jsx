import { useState } from 'react';
import { PageHeader } from '../components/Layout';
import LookupManager from '../components/LookupManager';

const TABS = [
  { key: 'types', label: 'Types', collectionPath: 'productTypes', itemLabel: 'Type', scopedToCategory: true },
  { key: 'materials', label: 'Materials', collectionPath: 'materials', itemLabel: 'Material', scopedToCategory: false },
];

export default function TypesMaterialsPage() {
  const [active, setActive] = useState('types');
  const tab = TABS.find((t) => t.key === active);

  return (
    <>
      <PageHeader
        title="Types & Materials"
        description="Scoped per category — same filters shown in the storefront sidebar."
      />

      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              active === t.key
                ? 'border-amber text-amber'
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <LookupManager
        collectionPath={tab.collectionPath}
        itemLabel={tab.itemLabel}
        scopedToCategory={tab.scopedToCategory}
      />
    </>
  );
}