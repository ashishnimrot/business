'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Search, Book, ChevronRight, X, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DocumentationService,
  FEATURE_IDS,
} from '@/lib/services/documentation.service';
import {
  FeatureDocumentation,
  DocumentationCategory,
} from '@/lib/data/documentation';
import { cn } from '@/lib/utils';

interface HelpCenterProps {
  onClose?: () => void;
  initialCategory?: DocumentationCategory;
  initialFeatureId?: string;
}

const categoryLabels: Record<DocumentationCategory, string> = {
  'getting-started': 'Getting Started',
  'parties': 'Parties',
  'inventory': 'Inventory',
  'invoices': 'Invoices',
  'payments': 'Payments',
  'reports': 'Reports',
  'business': 'Business',
  'troubleshooting': 'Troubleshooting',
};

const categoryIcons: Record<DocumentationCategory, React.ElementType> = {
  'getting-started': Book,
  'parties': Book,
  'inventory': Book,
  'invoices': Book,
  'payments': Book,
  'reports': Book,
  'business': Book,
  'troubleshooting': HelpCircle,
};

/**
 * HelpCenter Component
 * 
 * A comprehensive, searchable documentation center with:
 * - Search functionality
 * - Category browsing
 * - Detailed feature documentation
 * - Step-by-step guides
 * - Use cases and best practices
 * - FAQs
 */
export function HelpCenter({
  onClose,
  initialCategory,
  initialFeatureId,
}: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentationCategory | 'all'>(
    initialCategory || 'all'
  );
  const [selectedFeature, setSelectedFeature] = useState<FeatureDocumentation | null>(
    initialFeatureId ? DocumentationService.getById(initialFeatureId) || null : null
  );

  // Search and filter documentation
  const filteredDocs = useMemo(() => {
    let docs: FeatureDocumentation[];

    if (searchQuery.trim()) {
      docs = DocumentationService.search(searchQuery);
    } else if (selectedCategory === 'all') {
      docs = Object.values(DocumentationService.getByCategory('getting-started'))
        .concat(Object.values(DocumentationService.getByCategory('parties')))
        .concat(Object.values(DocumentationService.getByCategory('inventory')))
        .concat(Object.values(DocumentationService.getByCategory('invoices')))
        .concat(Object.values(DocumentationService.getByCategory('payments')))
        .concat(Object.values(DocumentationService.getByCategory('reports')))
        .concat(Object.values(DocumentationService.getByCategory('business')));
    } else {
      docs = DocumentationService.getByCategory(selectedCategory);
    }

    return docs;
  }, [searchQuery, selectedCategory]);

  const handleFeatureSelect = (feature: FeatureDocumentation) => {
    setSelectedFeature(feature);
  };

  const handleBack = () => {
    setSelectedFeature(null);
  };

  if (selectedFeature) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Back
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <FeatureDetailView feature={selectedFeature} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Help Center</h2>
          <p className="text-sm text-muted-foreground">
            Find answers and learn how to use all features
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as DocumentationCategory | 'all')} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="flex-1 overflow-y-auto mt-0">
          {filteredDocs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No documentation found for your search.' : 'No documentation available in this category.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDocs.map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleFeatureSelect(doc)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {doc.overview.what}
                        </CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{categoryLabels[doc.category]}</Badge>
                      <Badge variant="secondary">{doc.level}</Badge>
                      {doc.useCases.length > 0 && (
                        <Badge variant="outline">{doc.useCases.length} use cases</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Feature Detail View
 * Shows comprehensive documentation for a single feature
 */
function FeatureDetailView({ feature }: { feature: FeatureDocumentation }) {
  const relatedDocs = DocumentationService.getRelated(feature.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{categoryLabels[feature.category]}</Badge>
          <Badge variant="secondary">{feature.level}</Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">{feature.title}</h1>
        <p className="text-muted-foreground text-lg">{feature.overview.what}</p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">What is it?</h3>
            <p className="text-sm text-muted-foreground">{feature.overview.what}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Why use it?</h3>
            <p className="text-sm text-muted-foreground">{feature.overview.why}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">When to use it?</h3>
            <p className="text-sm text-muted-foreground">{feature.overview.when}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>{feature.quickStart.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {feature.quickStart.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.details && (
                    <ul className="mt-2 space-y-1">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Detailed Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Guide</CardTitle>
          <CardDescription>{feature.detailedGuide.introduction}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {feature.detailedGuide.steps.map((step, index) => (
              <div key={index} className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                {step.details && (
                  <ul className="space-y-1">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      {feature.useCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Use Cases</CardTitle>
            <CardDescription>Common scenarios and how to handle them</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {feature.useCases.map((useCase, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{useCase.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{useCase.description}</p>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Scenario:</p>
                    <p className="text-sm italic">{useCase.scenario}</p>
                  </div>
                  <div className="space-y-2">
                    {useCase.steps.map((step, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-primary font-semibold">{i + 1}.</span>
                        <div>
                          <span className="font-medium">{step.title}:</span>
                          <span className="text-muted-foreground ml-1">{step.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {useCase.tips && useCase.tips.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Tips:</p>
                      <ul className="space-y-1">
                        {useCase.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      {feature.bestPractices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
            <CardDescription>Recommended approaches for optimal results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feature.bestPractices.map((practice, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold mb-1">{practice.title}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{practice.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Why:</span> {practice.why}
                  </p>
                  {practice.example && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <span className="font-medium">Example:</span> {practice.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQs */}
      {feature.faqs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feature.faqs.map((faq, index) => (
                <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Features */}
      {relatedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {relatedDocs.map((doc) => (
                <Button
                  key={doc.id}
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/help?feature=${doc.id}`}
                >
                  {doc.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


