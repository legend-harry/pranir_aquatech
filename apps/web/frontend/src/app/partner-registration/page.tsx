"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Building2 } from "lucide-react";

export default function PartnerRegistration() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    labName: "",
    registrationNumber: "",
    yearEstablished: "",
    contactPerson: "",
    designation: "",
    email: user?.email || "",
    phone: "",
    alternatePhone: "",
    
    // Address
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    // Lab Details
    labType: "" as "private" | "government" | "research" | "",
    accreditation: [] as string[],
    otherAccreditation: "",
    serviceAreas: [] as string[],
    otherServiceArea: "",
    testingCapacity: "",
    
    // Infrastructure
    totalArea: "",
    testingEquipment: "",
    qualityControl: "",
    
    // Personnel
    totalStaff: "",
    qualifiedTechnicians: "",
    certifications: "",
    
    // Business Details
    annualTurnover: "",
    clientTypes: [] as string[],
    majorClients: "",
    servicesOffered: "",
    
    // Additional Information
    strengthsUSP: "",
    whyPartner: "",
    expectations: "",
    additionalInfo: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: "accreditation" | "serviceAreas" | "clientTypes", value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create partner registration request
      await addDoc(collection(db, "partnerRegistrations"), {
        ...formData,
        userId: user?.uid,
        status: "pending",
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Registration Submitted",
        description: "Thank you for your interest! We'll review your application and get back to you soon.",
      });

      router.push("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Failed to submit registration. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Lab Partner Registration</CardTitle>
            </div>
            <CardDescription>
              Join our network of certified aquaculture testing laboratories
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex gap-2 pt-4">
              {[1, 2, 3, 4, 5].map(num => (
                <div
                  key={num}
                  className={`flex-1 h-2 rounded-full ${
                    num <= step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="labName">Laboratory Name *</Label>
                      <Input
                        id="labName"
                        required
                        value={formData.labName}
                        onChange={(e) => handleInputChange("labName", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="registrationNumber">Registration Number *</Label>
                      <Input
                        id="registrationNumber"
                        required
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="yearEstablished">Year Established *</Label>
                      <Input
                        id="yearEstablished"
                        type="number"
                        required
                        value={formData.yearEstablished}
                        onChange={(e) => handleInputChange("yearEstablished", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        required
                        value={formData.designation}
                        onChange={(e) => handleInputChange("designation", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Input
                        id="alternatePhone"
                        type="tel"
                        value={formData.alternatePhone}
                        onChange={(e) => handleInputChange("alternatePhone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Address Details</h3>
                  
                  <div>
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        required
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Lab Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Laboratory Details</h3>
                  
                  <div>
                    <Label>Laboratory Type *</Label>
                    <RadioGroup
                      value={formData.labType}
                      onValueChange={(value) => handleInputChange("labType", value)}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private">Private</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="government" id="government" />
                        <Label htmlFor="government">Government</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="research" id="research" />
                        <Label htmlFor="research">Research Institute</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label>Accreditation/Certification *</Label>
                    <div className="space-y-2 mt-2">
                      {["NABL", "ISO 17025", "ISO 9001", "CAP-NABET", "None"].map(acc => (
                        <div key={acc} className="flex items-center space-x-2">
                          <Checkbox
                            id={acc}
                            checked={formData.accreditation.includes(acc)}
                            onCheckedChange={(checked) => handleCheckboxChange("accreditation", acc, checked as boolean)}
                          />
                          <Label htmlFor={acc}>{acc}</Label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other-acc"
                          checked={formData.accreditation.includes("Other")}
                          onCheckedChange={(checked) => handleCheckboxChange("accreditation", "Other", checked as boolean)}
                        />
                        <Label htmlFor="other-acc">Other</Label>
                        {formData.accreditation.includes("Other") && (
                          <Input
                            placeholder="Specify"
                            value={formData.otherAccreditation}
                            onChange={(e) => handleInputChange("otherAccreditation", e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Service Areas *</Label>
                    <div className="space-y-2 mt-2">
                      {["Water Quality", "Soil Testing", "Feed Analysis", "Disease Diagnosis", "Microbiology"].map(area => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={formData.serviceAreas.includes(area)}
                            onCheckedChange={(checked) => handleCheckboxChange("serviceAreas", area, checked as boolean)}
                          />
                          <Label htmlFor={area}>{area}</Label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other-service"
                          checked={formData.serviceAreas.includes("Other")}
                          onCheckedChange={(checked) => handleCheckboxChange("serviceAreas", "Other", checked as boolean)}
                        />
                        <Label htmlFor="other-service">Other</Label>
                        {formData.serviceAreas.includes("Other") && (
                          <Input
                            placeholder="Specify"
                            value={formData.otherServiceArea}
                            onChange={(e) => handleInputChange("otherServiceArea", e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="testingCapacity">Testing Capacity (samples/month) *</Label>
                    <Input
                      id="testingCapacity"
                      type="number"
                      required
                      value={formData.testingCapacity}
                      onChange={(e) => handleInputChange("testingCapacity", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Infrastructure & Personnel */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Infrastructure & Personnel</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="totalArea">Total Lab Area (sq.ft) *</Label>
                      <Input
                        id="totalArea"
                        type="number"
                        required
                        value={formData.totalArea}
                        onChange={(e) => handleInputChange("totalArea", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="totalStaff">Total Staff *</Label>
                      <Input
                        id="totalStaff"
                        type="number"
                        required
                        value={formData.totalStaff}
                        onChange={(e) => handleInputChange("totalStaff", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="qualifiedTechnicians">Qualified Technicians *</Label>
                      <Input
                        id="qualifiedTechnicians"
                        type="number"
                        required
                        value={formData.qualifiedTechnicians}
                        onChange={(e) => handleInputChange("qualifiedTechnicians", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="testingEquipment">Major Testing Equipment *</Label>
                    <Textarea
                      id="testingEquipment"
                      required
                      placeholder="List your key testing equipment"
                      value={formData.testingEquipment}
                      onChange={(e) => handleInputChange("testingEquipment", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="qualityControl">Quality Control Measures *</Label>
                    <Textarea
                      id="qualityControl"
                      required
                      placeholder="Describe your quality control procedures"
                      value={formData.qualityControl}
                      onChange={(e) => handleInputChange("qualityControl", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="certifications">Staff Certifications</Label>
                    <Textarea
                      id="certifications"
                      placeholder="List relevant staff certifications"
                      value={formData.certifications}
                      onChange={(e) => handleInputChange("certifications", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Business & Additional Info */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Business Details</h3>
                  
                  <div>
                    <Label htmlFor="annualTurnover">Approximate Annual Turnover *</Label>
                    <Select
                      value={formData.annualTurnover}
                      onValueChange={(value) => handleInputChange("annualTurnover", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<10L">Less than ₹10 Lakhs</SelectItem>
                        <SelectItem value="10-50L">₹10-50 Lakhs</SelectItem>
                        <SelectItem value="50L-1Cr">₹50 Lakhs - 1 Crore</SelectItem>
                        <SelectItem value="1-5Cr">₹1-5 Crores</SelectItem>
                        <SelectItem value=">5Cr">More than ₹5 Crores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Primary Client Types *</Label>
                    <div className="space-y-2 mt-2">
                      {["Fish Farms", "Shrimp Hatcheries", "Aquaculture Companies", "Government Bodies", "Research Institutes"].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={formData.clientTypes.includes(type)}
                            onCheckedChange={(checked) => handleCheckboxChange("clientTypes", type, checked as boolean)}
                          />
                          <Label htmlFor={type}>{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="majorClients">Major Clients (Optional)</Label>
                    <Textarea
                      id="majorClients"
                      placeholder="List 3-5 major clients (if comfortable sharing)"
                      value={formData.majorClients}
                      onChange={(e) => handleInputChange("majorClients", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="servicesOffered">Services Offered *</Label>
                    <Textarea
                      id="servicesOffered"
                      required
                      placeholder="Describe the testing and analytical services you offer"
                      value={formData.servicesOffered}
                      onChange={(e) => handleInputChange("servicesOffered", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="strengthsUSP">Your Strengths/USP *</Label>
                    <Textarea
                      id="strengthsUSP"
                      required
                      placeholder="What makes your laboratory stand out?"
                      value={formData.strengthsUSP}
                      onChange={(e) => handleInputChange("strengthsUSP", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whyPartner">Why partner with Pranir AquaTech? *</Label>
                    <Textarea
                      id="whyPartner"
                      required
                      placeholder="Your motivation for this partnership"
                      value={formData.whyPartner}
                      onChange={(e) => handleInputChange("whyPartner", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expectations">Expectations from Partnership *</Label>
                    <Textarea
                      id="expectations"
                      required
                      placeholder="What do you expect from this partnership?"
                      value={formData.expectations}
                      onChange={(e) => handleInputChange("expectations", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any other relevant information"
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-6 border-t">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    Previous
                  </Button>
                )}
                
                {step < 5 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
