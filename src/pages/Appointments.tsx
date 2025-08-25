import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  Edit,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Appointment = {
  id: string;
  patient_id: string | null;
  patient_name: string;
  date: string;
  time: string;
  type: string;
  doctor: string;
  status: string;
  duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const statusConfig = {
  scheduled: { 
    label: "Scheduled", 
    variant: "outline" as const, 
    icon: Clock, 
    color: "text-warning",
    bgColor: "bg-warning/10 border-warning/20"
  },
  "in-progress": { 
    label: "In Progress", 
    variant: "secondary" as const, 
    icon: Activity, 
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20"
  },
  completed: { 
    label: "Completed", 
    variant: "default" as const, 
    icon: CheckCircle, 
    color: "text-success",
    bgColor: "bg-success/10 border-success/20"
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "destructive" as const, 
    icon: XCircle, 
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/20"
  },
};

const appointmentTypes = ["All", "Consultation", "Follow-up", "Check-up", "Emergency", "Vaccination"];
const doctors = ["All Doctors", "Dr. Smith", "Dr. Johnson", "Dr. Wilson", "Dr. Emily Davis"];

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState("All Doctors");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || appointment.status === selectedStatus;
    const matchesType = selectedType === "All" || appointment.type === selectedType;
    const matchesDoctor = selectedDoctor === "All Doctors" || appointment.doctor === selectedDoctor;
    const matchesDate = selectedDate ? 
      appointment.date === selectedDate.toISOString().split('T')[0] : true;
    
    return matchesSearch && matchesStatus && matchesType && matchesDoctor && matchesDate;
  });

  const todayStats = {
    total: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    completed: appointments.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'completed').length,
    scheduled: appointments.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'scheduled').length,
    inProgress: appointments.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'in-progress').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointment Management</h1>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <Button className="gap-2 bg-gradient-medical hover:opacity-90" asChild>
          <Link to="/appointments/new">
            <Plus className="h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Total</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Appointments scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{todayStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently ongoing
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{todayStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar and Filters */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Doctor</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                {filteredAppointments.length} appointment(s) found
                {selectedDate && ` for ${selectedDate.toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => {
                  const config = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.scheduled;
                  const StatusIcon = config.icon;
                  
                  return (
                    <div 
                      key={appointment.id} 
                      className={`p-4 border rounded-lg hover:shadow-md transition-all ${config.bgColor}`}
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 w-full">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/80 shadow-sm">
                            <StatusIcon className={`h-6 w-6 ${config.color}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{appointment.patient_name}</h3>
                              <Badge variant={config.variant} className="text-xs w-fit">
                                {config.label}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {appointment.time} ({appointment.duration || 30} min)
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {appointment.doctor}
                              </div>
                              <div className="sm:col-span-2">
                                <span className="font-medium">{appointment.type}:</span> {appointment.notes || "No notes"}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 sm:ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Appointment Details</DialogTitle>
                                <DialogDescription>
                                  Complete appointment information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedAppointment && (
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p><strong>Patient:</strong> {selectedAppointment.patient_name}</p>
                                      <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                                      <p><strong>Time:</strong> {selectedAppointment.time}</p>
                                    </div>
                                    <div>
                                      <p><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
                                      <p><strong>Type:</strong> {selectedAppointment.type}</p>
                                      <p><strong>Duration:</strong> {selectedAppointment.duration || 30} minutes</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p><strong>Status:</strong> <Badge variant={config.variant}>{config.label}</Badge></p>
                                  </div>
                                  <div>
                                    <p><strong>Notes:</strong></p>
                                    <p className="text-muted-foreground mt-1">{selectedAppointment.notes || "No notes provided"}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No appointments found for the selected criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}