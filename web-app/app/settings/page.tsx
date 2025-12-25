"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/auth-store";
import { tokenStorage } from "@/lib/api-client";
import { Building2, Receipt, Settings as SettingsIcon, Bell, Shield, Database, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { businessId, user } = useAuthStore();
  const token = tokenStorage.getAccessToken();
  const [saved, setSaved] = useState(false);

  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    name: "",
    gst_number: "",
    pan_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    website: "",
  });

  // Invoice settings state
  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "INV",
    next_number: 1,
    terms_and_conditions: "",
    notes: "",
    due_days: 30,
    show_logo: true,
    show_signature: true,
  });

  // GST settings state
  const [gstSettings, setGstSettings] = useState({
    gst_enabled: true,
    default_cgst_rate: 9,
    default_sgst_rate: 9,
    default_igst_rate: 18,
    hsn_mandatory: true,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    payment_reminders: true,
    low_stock_alerts: true,
    invoice_due_alerts: true,
  });

  // Fetch business settings
  const { data: business, isLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        name: "ABC Traders",
        gst_number: "27AABCT1234A1Z5",
        pan_number: "AABCT1234A",
        address: "123 Market Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        phone: "+91 98765 43210",
        email: "info@abctraders.com",
        website: "www.abctraders.com",
      };
    },
    enabled: !!businessId,
  });

  useEffect(() => {
    if (business) {
      setBusinessSettings(business);
    }
  }, [business]);

  // Save business settings
  const saveBusinessMutation = useMutation({
    mutationFn: async (data: typeof businessSettings) => {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update business settings");
      return response.json();
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Save invoice settings
  const saveInvoiceMutation = useMutation({
    mutationFn: async (data: typeof invoiceSettings) => {
      const response = await fetch(`/api/businesses/${businessId}/settings/invoice`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update invoice settings");
      return response.json();
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSaveBusinessSettings = () => {
    saveBusinessMutation.mutate(businessSettings);
  };

  const handleSaveInvoiceSettings = () => {
    saveInvoiceMutation.mutate(invoiceSettings);
  };

  // Save GST settings
  const saveGstMutation = useMutation({
    mutationFn: async (data: typeof gstSettings) => {
      const response = await fetch(`/api/businesses/${businessId}/settings/gst`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update GST settings");
      return response.json();
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Save notification settings
  const saveNotificationMutation = useMutation({
    mutationFn: async (data: typeof notificationSettings) => {
      const response = await fetch(`/api/businesses/${businessId}/settings/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update notification settings");
      return response.json();
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSaveGstSettings = () => {
    saveGstMutation.mutate(gstSettings);
  };

  const handleSaveNotificationSettings = () => {
    saveNotificationMutation.mutate(notificationSettings);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your business settings and preferences"
        />

        <Tabs defaultValue="business" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger value="invoice" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Invoice</span>
            </TabsTrigger>
            <TabsTrigger value="gst" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">GST</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Business Settings Tab */}
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details that appear on invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input
                      id="business-name"
                      value={businessSettings.name}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, name: e.target.value })
                      }
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst-number">GST Number</Label>
                    <Input
                      id="gst-number"
                      value={businessSettings.gst_number}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, gst_number: e.target.value })
                      }
                      placeholder="e.g., 27AABCT1234A1Z5"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pan-number">PAN Number</Label>
                    <Input
                      id="pan-number"
                      value={businessSettings.pan_number}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, pan_number: e.target.value })
                      }
                      placeholder="e.g., AABCT1234A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={businessSettings.phone}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={businessSettings.email}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, email: e.target.value })
                      }
                      placeholder="info@yourbusiness.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={businessSettings.website}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, website: e.target.value })
                      }
                      placeholder="www.yourbusiness.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={businessSettings.address}
                    onChange={(e) =>
                      setBusinessSettings({ ...businessSettings, address: e.target.value })
                    }
                    placeholder="Street Address"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={businessSettings.city}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={businessSettings.state}
                      onValueChange={(value) =>
                        setBusinessSettings({ ...businessSettings, state: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={businessSettings.pincode}
                      onChange={(e) =>
                        setBusinessSettings({ ...businessSettings, pincode: e.target.value })
                      }
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveBusinessSettings} disabled={saveBusinessMutation.isPending}>
                    {saved ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {saveBusinessMutation.isPending ? "Saving..." : "Save Changes"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Settings Tab */}
          <TabsContent value="invoice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Settings</CardTitle>
                <CardDescription>
                  Configure how your invoices are generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                    <Input
                      id="invoice-prefix"
                      value={invoiceSettings.prefix}
                      onChange={(e) =>
                        setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })
                      }
                      placeholder="INV"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next-number">Next Invoice Number</Label>
                    <Input
                      id="next-number"
                      type="number"
                      value={invoiceSettings.next_number}
                      onChange={(e) =>
                        setInvoiceSettings({ ...invoiceSettings, next_number: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-days">Default Due Days</Label>
                  <Select
                    value={invoiceSettings.due_days.toString()}
                    onValueChange={(value) =>
                      setInvoiceSettings({ ...invoiceSettings, due_days: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="45">45 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <textarea
                    id="terms"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={invoiceSettings.terms_and_conditions}
                    onChange={(e) =>
                      setInvoiceSettings({ ...invoiceSettings, terms_and_conditions: e.target.value })
                    }
                    placeholder="Enter default terms and conditions..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Default Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={invoiceSettings.notes}
                    onChange={(e) =>
                      setInvoiceSettings({ ...invoiceSettings, notes: e.target.value })
                    }
                    placeholder="Enter default notes for invoices..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveInvoiceSettings} disabled={saveInvoiceMutation.isPending}>
                    {saved ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {saveInvoiceMutation.isPending ? "Saving..." : "Save Changes"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GST Settings Tab */}
          <TabsContent value="gst" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GST Configuration</CardTitle>
                <CardDescription>
                  Configure GST rates and compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="gst-enabled"
                    checked={gstSettings.gst_enabled}
                    onChange={(e) =>
                      setGstSettings({ ...gstSettings, gst_enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="gst-enabled">Enable GST on Invoices</Label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cgst-rate">Default CGST Rate (%)</Label>
                    <Input
                      id="cgst-rate"
                      type="number"
                      step="0.5"
                      value={gstSettings.default_cgst_rate}
                      onChange={(e) =>
                        setGstSettings({ ...gstSettings, default_cgst_rate: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sgst-rate">Default SGST Rate (%)</Label>
                    <Input
                      id="sgst-rate"
                      type="number"
                      step="0.5"
                      value={gstSettings.default_sgst_rate}
                      onChange={(e) =>
                        setGstSettings({ ...gstSettings, default_sgst_rate: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="igst-rate">Default IGST Rate (%)</Label>
                    <Input
                      id="igst-rate"
                      type="number"
                      step="0.5"
                      value={gstSettings.default_igst_rate}
                      onChange={(e) =>
                        setGstSettings({ ...gstSettings, default_igst_rate: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hsn-mandatory"
                    checked={gstSettings.hsn_mandatory}
                    onChange={(e) =>
                      setGstSettings({ ...gstSettings, hsn_mandatory: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="hsn-mandatory">Make HSN Code Mandatory</Label>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> For intra-state transactions, CGST + SGST will be applied.
                    For inter-state transactions, IGST will be applied automatically based on the
                    party's state.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGstSettings} disabled={saveGstMutation.isPending}>
                    {saved && !saveGstMutation.isPending ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {saveGstMutation.isPending ? "Saving..." : "Save GST Settings"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          email_notifications: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Payment Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about pending payments
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.payment_reminders}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          payment_reminders: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Low Stock Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Alert when inventory items are running low
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.low_stock_alerts}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          low_stock_alerts: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Invoice Due Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Notify when invoices are approaching due date
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.invoice_due_alerts}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          invoice_due_alerts: e.target.checked,
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotificationSettings} disabled={saveNotificationMutation.isPending}>
                    {saved && !saveNotificationMutation.isPending ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {saveNotificationMutation.isPending ? "Saving..." : "Save Preferences"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
