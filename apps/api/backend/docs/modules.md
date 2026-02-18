# Feature Modules

This app separates domain features into individual modules to avoid importing all functionality by default. Import only what you need:

## Modules

- Projects: `@/modules/projects`
- Transactions: `@/modules/transactions`
- Fishfarm (shrimp): `@/modules/fishfarm`
- Employees: `@/modules/employees` (placeholder)

## Usage

### Direct import (tree-shaken)

```ts
import { useUserProjects, useProjectCount } from '@/modules/projects';
import { useUserTransactions } from '@/modules/transactions';
```

### Dynamic import (code-splitting)

Use Next.js `dynamic()` to load heavy components or modules on demand:

```tsx
import dynamic from 'next/dynamic';

const AddExpenseDialog = dynamic(() => import('@/components/add-expense-dialog'));

// Or for module functions wrapped in a helper component
const TransactionsModule = dynamic(() => import('@/modules/transactions'));
```

Avoid creating a barrel `src/modules/index.ts` to prevent accidental eager imports of all domains.
