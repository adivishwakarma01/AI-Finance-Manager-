import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ExternalLink, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BaseCrudService } from '@/integrations';
import { InvestmentSuggestions } from '@/entities';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentSuggestions[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<InvestmentSuggestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadInvestments();
  }, []);

  useEffect(() => {
    filterInvestmentData();
  }, [investments, searchTerm, filterRisk, filterType]);

  const loadInvestments = async () => {
    setLoading(true);
    const { items } = await BaseCrudService.getAll<InvestmentSuggestions>('investmentsuggestions');
    setInvestments(items);
    setLoading(false);
  };

  const filterInvestmentData = () => {
    let filtered = [...investments];

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.investmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRisk !== 'all') {
      filtered = filtered.filter(inv => inv.riskLevel?.toLowerCase() === filterRisk.toLowerCase());
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(inv => inv.investmentType?.toLowerCase() === filterType.toLowerCase());
    }

    setFilteredInvestments(filtered);
  };

  const riskLevels = Array.from(new Set(investments.map(inv => inv.riskLevel).filter(Boolean)));
  const investmentTypes = Array.from(new Set(investments.map(inv => inv.investmentType).filter(Boolean)));

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-secondary-foreground/70">Loading investment suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 pt-24 sm:pt-28 lg:pt-32 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 flex-wrap mb-8 sm:mb-10 mt-4 sm:mt-6">
          <h1 className="font-heading text-4xl font-bold mb-2">Investment Suggestions</h1>
          <p className="font-paragraph text-secondary-foreground/70">
            Beginner-friendly investment opportunities tailored to your goals
          </p>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Investment Guidance</h3>
                  <p className="font-paragraph text-sm text-secondary-foreground/80">
                    These suggestions are based on your financial profile and goals. Always do your own research and consider consulting with a financial advisor before making investment decisions. Past performance doesn't guarantee future results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card className="bg-secondary border-none mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="font-paragraph text-sm mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground/40" />
                  <Input
                    placeholder="Search investments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-background border-none pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="font-paragraph text-sm mb-2 block">Risk Level</Label>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="bg-background border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-none z-50">
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    {riskLevels.map((risk) => (
                      <SelectItem key={risk} value={risk?.toLowerCase() || ''}>
                        {risk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-paragraph text-sm mb-2 block">Investment Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-background border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-none z-50">
                    <SelectItem value="all">All Types</SelectItem>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type} value={type?.toLowerCase() || ''}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestments.length > 0 ? (
            filteredInvestments.map((investment, index) => (
              <motion.div
                key={investment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-secondary border-none hover:bg-secondary/80 transition-all h-full flex flex-col">
                  {investment.investmentImage && (
                    <div className="relative h-48 overflow-hidden rounded-t-xl">
                      <Image
                        src={investment.investmentImage}
                        alt={investment.investmentName || 'Investment'}
                        className="w-full h-full object-cover"
                        width={400}
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getRiskColor(investment.riskLevel)} border`}>
                          {investment.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-heading text-xl font-bold">{investment.investmentName}</h3>
                        {!investment.investmentImage && (
                          <Badge className={`${getRiskColor(investment.riskLevel)} border`}>
                            {investment.riskLevel}
                          </Badge>
                        )}
                      </div>

                      {investment.investmentType && (
                        <p className="font-paragraph text-sm text-primary mb-3">
                          {investment.investmentType}
                        </p>
                      )}

                      <p className="font-paragraph text-sm text-secondary-foreground/80 mb-4">
                        {investment.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        {investment.potentialReturns && (
                          <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                            <span className="font-paragraph text-sm text-secondary-foreground/70">
                              Potential Returns
                            </span>
                            <span className="font-heading text-sm font-semibold text-primary">
                              {investment.potentialReturns}
                            </span>
                          </div>
                        )}

                        {investment.minimumInvestment !== undefined && (
                          <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                            <span className="font-paragraph text-sm text-secondary-foreground/70">
                              Minimum Investment
                            </span>
                            <span className="font-heading text-sm font-semibold">
                              ${investment.minimumInvestment.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {investment.learnMoreUrl && (
                      <a
                        href={investment.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          Learn More
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="bg-secondary border-none">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-secondary-foreground/40 mx-auto mb-4" />
                  <h3 className="font-heading text-xl font-semibold mb-2">No investments found</h3>
                  <p className="font-paragraph text-secondary-foreground/70">
                    Try adjusting your filters to see more options
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Educational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="bg-secondary border-none">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Understanding Risk Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <h4 className="font-heading text-lg font-semibold text-green-400 mb-2">Low Risk</h4>
                  <p className="font-paragraph text-sm text-secondary-foreground/80">
                    Stable investments with lower returns but minimal chance of loss. Ideal for preserving capital and steady growth.
                  </p>
                </div>

                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <h4 className="font-heading text-lg font-semibold text-yellow-400 mb-2">Medium Risk</h4>
                  <p className="font-paragraph text-sm text-secondary-foreground/80">
                    Balanced approach with moderate returns and manageable risk. Good for long-term growth with some volatility.
                  </p>
                </div>

                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <h4 className="font-heading text-lg font-semibold text-red-400 mb-2">High Risk</h4>
                  <p className="font-paragraph text-sm text-secondary-foreground/80">
                    Potential for high returns but significant risk of loss. Suitable for experienced investors with risk tolerance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
