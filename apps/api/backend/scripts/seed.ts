import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

console.log(`
====================================
Pranir-AquaTech Firestore Seed Script
====================================

This script will create sample users and data in Firestore.
It is intended for development and testing purposes.

⚠️  WARNING: This will create new Firebase Authentication users and Firestore documents.

To proceed, run with --force flag:
  npx tsx scripts/seed.ts --force

Data Structure:
- users/{uid}/profile - User profile (email, name, role)
- users/{uid}/transactions - Customer transactions
- users/{uid}/analytics - AI-generated insights
- users/{uid}/documents - Shared documents
- shared_documents/{docId} - Community shared documents
`);

const force = process.argv.includes("--force");

if (!force) {
  console.log("❌ Exiting: --force flag not provided.");
  process.exit(0);
}

const firebaseConfig = {
  apiKey: "AIzaSyCj9yaVKWE2Q60rXCn9SIAUrqBEJ14r3ZE",
  authDomain: "praniraqua.firebaseapp.com",
  projectId: "praniraqua",
  storageBucket: "praniraqua.firebasestorage.app",
  messagingSenderId: "1040296367403",
  appId: "1:1040296367403:web:37d5c6af092318a086e16e",
  measurementId: "G-T3GLKYSX70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

interface UserData {
  email: string;
  password: string;
  name: string;
  role: "customer" | "partner";
  phoneNumber?: string;
}

interface Transaction {
  date: Date;
  title: string;
  amount: number;
  category: string;
  vendor: string;
  description: string;
  type: "expense" | "income";
  status: "completed" | "credit" | "expected";
  quantity?: number;
  unit?: string;
  ratePerUnit?: number;
  invoiceNo?: string;
}

const sampleUsers: UserData[] = [
  {
    email: "customer@praniraqua.com",
    password: "Customer@123",
    name: "Aqua Farmer",
    role: "customer",
    phoneNumber: "+1234567890"
  },
  {
    email: "demo@praniraqua.com",
    password: "Demo@123",
    name: "Demo User",
    role: "customer",
    phoneNumber: "+0987654321"
  }
];

const sampleTransactions: Transaction[] = [
  {
    date: new Date("2025-09-01"),
    title: "Pond Construction Materials",
    amount: 45000,
    category: "Bore Construction",
    vendor: "Vijay Lakshmi Engineering",
    description: "Pipes and construction materials",
    type: "expense",
    status: "completed",
    quantity: 20,
    unit: "units",
    ratePerUnit: 2250,
    invoiceNo: "VLG001"
  },
  {
    date: new Date("2025-09-05"),
    title: "Labour Cost",
    amount: 12000,
    category: "Labour",
    vendor: "Local Workers",
    description: "Labour for pond construction - 10 days",
    type: "expense",
    status: "completed",
    quantity: 10,
    unit: "days",
    ratePerUnit: 1200,
    invoiceNo: "LAB001"
  },
  {
    date: new Date("2025-09-08"),
    title: "Power Connection Setup",
    amount: 25000,
    category: "Power Setup",
    vendor: "Local Utility",
    description: "Electrical installation for farm",
    type: "expense",
    status: "credit",
    invoiceNo: "PWR001"
  },
  {
    date: new Date("2025-09-10"),
    title: "Expected Feed Purchase",
    amount: 8000,
    category: "Feed",
    vendor: "Feed Supplier",
    description: "Monthly feed budget",
    type: "expense",
    status: "expected",
    invoiceNo: "FEED001"
  },
  {
    date: new Date("2025-09-15"),
    title: "Farm Income",
    amount: 50000,
    category: "Sales",
    vendor: "Market Sales",
    description: "Initial harvest sales",
    type: "income",
    status: "completed",
    invoiceNo: "INC001"
  }
];

const sampleModules = [
  {
    id: "aquaculture",
    name: "Aquaculture Management",
    enabled: true,
    tier: "free"
  },
  {
    id: "finance",
    name: "Financial Analytics",
    enabled: true,
    tier: "free"
  },
  {
    id: "community",
    name: "Community Docs",
    enabled: true,
    tier: "pro"
  },
  {
    id: "ai_insights",
    name: "AI Insights Engine",
    enabled: true,
    tier: "pro"
  }
];

async function seedDatabase() {
  try {
    console.log("\n🚀 Starting database seed...\n");

    for (const user of sampleUsers) {
      try {
        console.log(`📝 Creating user: ${user.email}`);
        
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        const uid = userCredential.user.uid;

        // Create user profile document
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, {
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          tier: "free",
          isOnboarded: true
        });

        console.log(`✅ User profile created for: ${user.name}`);

        // Add transactions
        console.log(`   Adding ${sampleTransactions.length} sample transactions...`);
        const transactionsRef = collection(db, "users", uid, "transactions");
        
        for (const txn of sampleTransactions) {
          const txnDocRef = doc(transactionsRef);
          await setDoc(txnDocRef, {
            ...txn,
            userId: uid,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        console.log(`✅ Added ${sampleTransactions.length} transactions`);

        // Add modules
        console.log(`   Adding ${sampleModules.length} available modules...`);
        const modulesRef = collection(db, "users", uid, "modules");
        
        for (const module of sampleModules) {
          const moduleDocRef = doc(modulesRef, module.id);
          await setDoc(moduleDocRef, {
            ...module,
            createdAt: new Date()
          });
        }

        console.log(`✅ Added ${sampleModules.length} modules\n`);

      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          console.log(`⚠️  User already exists: ${user.email}`);
        } else {
          throw error;
        }
      }
    }

    // Add community shared documents
    console.log("📚 Adding community shared documents...");
    const sharedDocsRef = collection(db, "shared_documents");
    
    const sharedDoc = {
      title: "Best Practices for Aquaculture",
      description: "Community guide for successful aquaculture operations",
      author: "Community",
      category: "aquaculture",
      content: "# Best Practices\n\n1. Water Quality Management\n2. Feed Optimization\n3. Disease Prevention",
      tags: ["aquaculture", "best-practices", "guide"],
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      helpful: 0
    };

    await setDoc(doc(sharedDocsRef), sharedDoc);
    console.log("✅ Added community shared documents\n");

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Sample User Credentials:");
    console.log("================================");
    sampleUsers.forEach(user => {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
    });
    console.log("\n================================\n");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedDatabase();

