'use client';

import { useState } from 'react';
import { AppLayout, BottomNav } from '@/components/layout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoList } from '@/components/ui/video-player';
import { HelpCenter } from '@/components/ui/help-center';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DocumentationService, FEATURE_IDS } from '@/lib/services/documentation.service';
import { getAllVideos, areVideosReady } from '@/lib/data/video-tutorials';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Mail, 
  Phone,
  ExternalLink,
  FileText,
  Video,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  
  // Get comprehensive FAQs from documentation
  const allFAQs = DocumentationService.getAllFAQs();
  const faqs = allFAQs.length > 0 ? allFAQs : [
    {
      question: 'How do I create my first invoice?',
      answer: 'Go to Invoices → Create Invoice, select the party, add items, and click Save. Your invoice will be automatically numbered.',
    },
    {
      question: 'How do I add a new customer or supplier?',
      answer: 'Navigate to Parties → Add Party. Fill in the details including name, type (customer/supplier), and contact information.',
    },
    {
      question: 'How do I record a payment?',
      answer: 'Go to Payments → Record Payment. Select the party, enter the amount, payment mode, and optionally link it to an invoice.',
    },
    {
      question: 'How do I export my data?',
      answer: 'Each list page (Parties, Inventory, Invoices, Payments) has an "Export Excel" button. Invoice detail pages have a "Download PDF" option.',
    },
    {
      question: 'How do I manage my inventory?',
      answer: 'Go to Inventory → Add Item. Enter item details including name, prices, GST rate, and stock quantity. Low stock items are highlighted.',
    },
  ];

  const handleResourceClick = (action: string) => {
    switch (action) {
      case 'View Docs':
        setExpandedSection(expandedSection === 'docs' ? null : 'docs');
        break;
      case 'Watch Videos':
        setExpandedSection(expandedSection === 'videos' ? null : 'videos');
        break;
      case 'Browse FAQs':
        const faqSection = document.getElementById('faqs-section');
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
    }
  };

  const helpResources = [
    {
      title: 'Documentation',
      description: 'Learn how to use all features of the application',
      icon: Book,
      action: 'View Docs',
      color: 'bg-blue-100 text-blue-600',
      sectionId: 'docs',
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      action: 'Watch Videos',
      color: 'bg-purple-100 text-purple-600',
      sectionId: 'videos',
    },
    {
      title: 'FAQs',
      description: 'Find answers to common questions',
      icon: FileText,
      action: 'Browse FAQs',
      color: 'bg-green-100 text-green-600',
      sectionId: 'faqs',
    },
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: Mail,
      value: 'support@example.com',
    },
    {
      title: 'Phone Support',
      description: 'Talk to our support team',
      icon: Phone,
      value: '+91 1800-XXX-XXXX',
    },
    {
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      icon: MessageCircle,
      value: 'Available 9 AM - 6 PM IST',
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Help & Support"
        description="Get help with using the application"
      />

      {/* Open Documentation Center Button */}
      <div className="mb-6">
        <Sheet open={helpCenterOpen} onOpenChange={setHelpCenterOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Browse Complete Documentation
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <HelpCenter onClose={() => setHelpCenterOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Quick Help Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {helpResources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Card key={resource.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${resource.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleResourceClick(resource.action)}
                    >
                      {resource.action}
                      {resource.sectionId === 'faqs' ? (
                        <ExternalLink className="h-3 w-3" />
                      ) : expandedSection === resource.sectionId ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                {expandedSection === resource.sectionId && resource.sectionId === 'docs' && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Quick Start Guide</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                      <li>• Getting Started with your Business Dashboard</li>
                      <li>• Creating and Managing Invoices</li>
                      <li>• Managing Parties (Customers & Suppliers)</li>
                      <li>• Inventory Management Basics</li>
                      <li>• Recording and Tracking Payments</li>
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHelpCenterOpen(true)}
                      className="w-full"
                    >
                      <Book className="h-3 w-3 mr-2" />
                      View Complete Documentation
                    </Button>
                  </div>
                )}
                {expandedSection === resource.sectionId && resource.sectionId === 'videos' && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-4">Video Tutorials</h4>
                    {areVideosReady() ? (
                      <VideoList videos={getAllVideos()} className="mt-2" />
                    ) : (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          Video tutorials are being prepared. Here's what's coming:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          {getAllVideos().map((video) => (
                            <li key={video.id} className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              <span>
                                <strong>{video.title}</strong> ({video.duration} min)
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          Videos will be available soon. Check back later!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQs */}
      <Card className="mb-8" id="faqs-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.slice(0, 10).map((faq, index) => (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <h4 className="font-medium text-sm mb-2">{faq.question}</h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
            {faqs.length > 10 && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHelpCenterOpen(true)}
                  className="w-full"
                >
                  View All {faqs.length} FAQs
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Need more help? Reach out to our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.title} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">{option.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{option.description}</p>
                  <p className="text-sm font-medium">{option.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <BottomNav />
    </AppLayout>
  );
}
