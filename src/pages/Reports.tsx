import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calendar, Download, FileText, TrendingUp, Users, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReport, setSelectedReport] = useState("appointments");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0
  });
  const { toast } = useToast();

  const reportTypes = [
    { value: "appointments", label: "Appointment Reports", icon: Calendar },
    { value: "patients", label: "Patient Reports", icon: Users },
    { value: "revenue", label: "Revenue Reports", icon: TrendingUp },
    { value: "performance", label: "Performance Reports", icon: BarChart3 }
  ];

  const timePeriods = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsResult, appointmentsResult] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('appointments').select('*')
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsResult.data?.filter(apt => apt.date === today) || [];
      const completedAppointments = appointmentsResult.data?.filter(apt => apt.status === 'completed') || [];

      setStats({
        totalPatients: patientsResult.data?.length || 0,
        totalAppointments: appointmentsResult.data?.length || 0,
        completedAppointments: completedAppointments.length,
        todayAppointments: todayAppointments.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      let reportData: any = {};
      let reportTitle = "";
      let reportDescription = "";

      // Fetch data based on selected report type
      if (selectedReport === "appointments") {
        const { data } = await supabase.from('appointments').select(`
          *,
          patients(first_name, last_name)
        `);
        reportData = data || [];
        reportTitle = `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Appointment Report`;
        reportDescription = `Total appointments: ${reportData.length}, Completed: ${reportData.filter((apt: any) => apt.status === 'completed').length}`;
      } else if (selectedReport === "patients") {
        const { data } = await supabase.from('patients').select('*');
        reportData = data || [];
        reportTitle = `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Patient Report`;
        reportDescription = `Total patients: ${reportData.length}, Active records in system`;
      } else if (selectedReport === "revenue") {
        const { data } = await supabase.from('appointments').select('*');
        const completedAppointments = data?.filter(apt => apt.status === 'completed') || [];
        reportData = completedAppointments;
        reportTitle = `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Revenue Report`;
        reportDescription = `Based on ${completedAppointments.length} completed appointments`;
      } else if (selectedReport === "performance") {
        const [appointmentsResult, patientsResult] = await Promise.all([
          supabase.from('appointments').select('*'),
          supabase.from('patients').select('*')
        ]);
        reportData = {
          appointments: appointmentsResult.data || [],
          patients: patientsResult.data || []
        };
        reportTitle = `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Performance Report`;
        reportDescription = `Clinic performance metrics and analytics`;
      }

      // Create new report entry
      const newReport = {
        id: Date.now(),
        title: reportTitle,
        description: reportDescription,
        lastGenerated: new Date().toISOString().split('T')[0],
        status: "ready",
        data: reportData,
        type: selectedReport,
        period: selectedPeriod
      };

      setGeneratedReports(prev => [newReport, ...prev]);

      toast({
        title: "Report Generated",
        description: `${reportTitle} has been successfully generated.`
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: any) => {
    const blob = new Blob([JSON.stringify(report.data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${report.lastGenerated}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `${report.title} has been downloaded as a JSON file.`
    });
  };

  const exportTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('appointments').select(`
        *,
        patients(first_name, last_name)
      `).eq('date', today);

      downloadReport({
        title: "Today's Appointments",
        data: data || [],
        lastGenerated: today
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export today's appointments.",
        variant: "destructive"
      });
    }
  };

  const exportPatientDatabase = async () => {
    try {
      const { data } = await supabase.from('patients').select('*');
      downloadReport({
        title: "Patient Database",
        data: data || [],
        lastGenerated: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export patient database.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "default";
      case "generating": return "secondary";
      case "error": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and view detailed reports about your clinic operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Total appointments in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foregreen">Scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate New Report
            </CardTitle>
            <CardDescription>Create custom reports for your clinic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={generateReport} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>Your latest generated reports and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reports generated yet</p>
                  <p className="text-xs">Use the form to generate your first report</p>
                </div>
              ) : (
                generatedReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{report.title}</h4>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Generated: {report.lastGenerated}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(report.status) as any}>
                        {report.status}
                      </Badge>
                      {report.status === "ready" && (
                        <Button size="sm" variant="outline" onClick={() => downloadReport(report)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common reporting tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={exportTodayAppointments}>
              <Calendar className="mr-2 h-4 w-4" />
              Export Today's Appointments
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={exportPatientDatabase}>
              <Users className="mr-2 h-4 w-4" />
              Export Patient Database
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => {
              setSelectedReport("revenue");
              setSelectedPeriod("month");
              generateReport();
            }}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Monthly Revenue Report
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => {
              setSelectedReport("performance");
              setSelectedPeriod("month");
              generateReport();
            }}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Performance Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automatically generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Weekly Summary</p>
                  <p className="text-xs text-muted-foreground">Every Monday at 9:00 AM</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Monthly Revenue</p>
                  <p className="text-xs text-muted-foreground">1st of every month</p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Quarterly Analysis</p>
                  <p className="text-xs text-muted-foreground">Start of each quarter</p>
                </div>
                <Badge variant="secondary">Paused</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}