
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/data";
import { useUserProjects } from "@/modules/projects";
import { useUserTransactions } from "@/modules/transactions";
import { useUserBudgets } from "@/modules/budgets";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";


export function AddExpenseDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | undefined>();
  
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useUserProjects();
  const { addTransaction } = useUserTransactions();
  const { budgets, loading: budgetsLoading } = useUserBudgets(selectedProjectId);
  const activeProjects = useMemo(() => projects.filter(p => !p.archived), [projects]);
  
  useEffect(() => {
    if (open) {
      const defaultProjectId = localStorage.getItem('defaultProjectId');
      if (defaultProjectId && defaultProjectId !== 'all') {
        setSelectedProjectId(defaultProjectId);
      }
    }
  }, [open]);

  const handleReceiptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setReceiptPreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (!data.projectId) {
        toast({
            variant: "destructive",
            title: "Project Required",
            description: "Please select a project for this transaction.",
        });
        setIsLoading(false);
        return;
    }
    
    let receiptUrl = "";
    // Receipt upload to Firebase Storage disabled for now
    
    const newTransaction = {
        title: data.title,
        amount: Number(data.amount),
        quantity: Number(data.qty) || 0,
        ratePerUnit: Number(data.ratePerUnit) || 0,
        date: data.date ? new Date(data.date as string).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        receiptUrl: receiptUrl,
        createdBy: user?.displayName || user?.email || "Unknown",
        type: data.type,
        status: data.type === 'income' ? 'completed' : data.status,
        category: data.type === 'income' ? 'Income' : data.category,
        projectId: data.projectId,
        description: data.description || "",
        vendor: data.vendor || "",
        invoiceNo: data.invoiceNo || "",
        unit: data.unit || "",
        notes: data.notes || "",
    };
    
    try {
        await addTransaction(newTransaction);
        
        setIsLoading(false);
        setOpen(false);
        setReceiptPreview(null);
        setTransactionType(undefined);
        (event.target as HTMLFormElement).reset();
        
        toast({
            title: "Transaction Added",
            description: `Successfully added ${formatCurrency(
            Number(data.amount), currency
            )} for ${data.title}.`,
        });

    } catch (error) {
        console.error("Failed to add expense:", error);
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to save the transaction.",
        });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
              setTransactionType(undefined);
              setReceiptPreview(null);
          }
      }}>
        <div onClick={() => setOpen(true)}>{children}</div>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Enter the details of your transaction. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="h-[70vh] p-1">
              <div className="grid gap-4 py-4 pr-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project" className="text-right">
                      Project *
                    </Label>
                    <Select name="projectId" required value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {projectsLoading ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : (
                            activeProjects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                {project.name}
                                </SelectItem>
                            ))
                            )}
                        </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Type *</Label>
                      <RadioGroup
                        name="type"
                        required
                        className="col-span-3 flex gap-4"
                        onValueChange={(value) => setTransactionType(value as 'expense' | 'income')}
                        value={transactionType}
                      >
                          <div className="flex items-center space-x-2">
                          <RadioGroupItem value="expense" id="r-expense" />
                          <Label htmlFor="r-expense">Expense</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                          <RadioGroupItem value="income" id="r-income" />
                          <Label htmlFor="r-income">Income</Label>
                          </div>
                      </RadioGroup>
                  </div>
                  
                  {transactionType && (
                      <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title *
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                required
                                className="col-span-3"
                            />
                          </div>

                          {transactionType === 'expense' && (
                          <>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="category" className="text-right">
                                  Category *
                              </Label>
                              <Select name="category" required disabled={!selectedProjectId}>
                                  <SelectTrigger className="col-span-3">
                                  <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {!budgetsLoading && budgets.filter(b=>b.projectId===selectedProjectId).map((b) => (
                                        <SelectItem key={b.id} value={b.category}>{b.category}</SelectItem>
                                      ))}
                                      <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Status</Label>
                                <RadioGroup name="status" defaultValue="completed" className="col-span-3 flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="completed" id="r-completed" />
                                        <Label htmlFor="r-completed">Completed</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="credit" id="r-credit" />
                                        <Label htmlFor="r-credit">Credit</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="expected" id="r-expected" />
                                        <Label htmlFor="r-expected">Expected</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                          </>
                          )}

                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="date" className="text-right">
                              Date *
                          </Label>
                          <Input
                              id="date"
                              name="date"
                              type="date"
                              defaultValue={new Date().toISOString().split("T")[0]}
                              required
                              className="col-span-3"
                          />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                              Amount *
                          </Label>
                          <Input
                              id="amount"
                              name="amount"
                              type="number"
                              step="0.01"
                              required
                              className="col-span-3"
                          />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                              Description
                          </Label>
                          <Textarea
                              id="description"
                              name="description"
                              className="col-span-3"
                          />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="vendor" className="text-right">
                              Vendor
                          </Label>
                          <Input
                              id="vendor"
                              name="vendor"
                              className="col-span-3"
                          />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="invoiceNo" className="text-right">
                              Invoice No
                          </Label>
                          <Input
                              id="invoiceNo"
                              name="invoiceNo"
                              className="col-span-3"
                          />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="qty" className="text-right">
                              Quantity
                          </Label>
                          <Input
                              id="qty"
                              name="qty"
                              type="number"
                              className="col-span-3"
                          />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="unit" className="text-right">
                              Unit
                          </Label>
                          <Input
                              id="unit"
                              name="unit"
                              className="col-span-3"
                          />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="notes" className="text-right">
                              Notes
                          </Label>
                          <Textarea
                              id="notes"
                              name="notes"
                              className="col-span-3"
                          />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="receipt" className="text-right">
                              Receipt
                          </Label>
                          <Input
                              id="receipt"
                              name="receipt"
                              type="file"
                              accept="image/*"
                              className="col-span-3"
                              onChange={handleReceiptChange}
                          />
                          </div>
                          {receiptPreview && (
                              <div className="grid grid-cols-4 items-start gap-4">
                                  <div className="col-start-2 col-span-3">
                                      <img src={receiptPreview} alt="Receipt preview" className="rounded-md max-h-40 object-contain" />
                                  </div>
                              </div>
                          )}
                      </>
                  )}
                </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => {
                    setReceiptPreview(null);
                    setTransactionType(undefined);
                }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading || projectsLoading || !transactionType}>
                {isLoading ? "Saving..." : "Save Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
