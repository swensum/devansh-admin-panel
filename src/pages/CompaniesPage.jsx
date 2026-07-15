import { PageHeader } from '../components/Layout';
import LookupManager from '../components/LookupManager';

export default function CompaniesPage() {
  return (
    <>
      <PageHeader title="Companies" description="Brands/manufacturers products can be attributed to." />
      <LookupManager collectionPath="companies" itemLabel="Company" />
    </>
  );
}
