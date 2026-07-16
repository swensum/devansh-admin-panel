import { PageHeader } from '../components/Layout';
import LookupManager from '../components/LookupManager';

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Categories" description="Top-level catalog sections shown on the storefront." />
      <LookupManager collectionPath="categories" itemLabel="Category" hasImage />
    </>
  );
}
