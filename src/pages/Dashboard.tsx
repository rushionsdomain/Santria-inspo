import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  CalendarPlus,
  TrendingUp,
  Activity
} from "lucide-react";

// Mock data for demonstration
const todayStats = {
  totalAppointments: 12,
  completed: 8,
  pending: 3,
  cancelled: 1,
  totalPatients: 156,
  newPatients: 3,
};

const recentAppointments = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    time: "09:00 AM",
    type: "Consultation",
    status: "completed",
  },
  {
    id: 2,
    patientName: "Michael Chen",
    time: "10:30 AM",
    type: "Follow-up",
    status: "in-progress",
  },
  {
    id: 3,
    patientName: "Emma Wilson",
    time: "11:00 AM",
    type: "Check-up",
    status: "pending",
  },
  {
    id: 4,
    patientName: "David Brown",
    time: "02:00 PM",
    type: "Consultation",
    status: "pending",
  },
];

const statusConfig = {
  completed: { label: "Completed", variant: "default", icon: CheckCircle, color: "text-success" },
  "in-progress": { label: "In Progress", variant: "secondary", icon: Activity, color: "text-primary" },
  pending: { label: "Pending", variant: "outline", icon: Clock, color: "text-warning" },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle, color: "text-destructive" },
} as const;

import { Link } from "react-router-dom";

export default function Dashboard() {
  const completionRate = Math.round((todayStats.completed / todayStats.totalAppointments) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your clinic overview for today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/patients/new">
              <UserPlus className="h-4 w-4" />
              New Patient
            </Link>
          </Button>
          <Button className="gap-2 bg-gradient-medical hover:opacity-90" asChild>
            <Link to="/appointments/new">
              <CalendarPlus className="h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completion rate
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{todayStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting consultation
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +{todayStats.newPatients} new today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Overview of today's appointments and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => {
                const config = statusConfig[appointment.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-light">
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time}</p>
                      <Badge variant={config.variant as any} className="mt-1">
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Overview
            </CardTitle>
            <CardDescription>
              Key metrics at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-2xl font-bold text-success">{completionRate}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Patients Today</span>
                <span className="font-semibold text-primary">+{todayStats.newPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Wait Time</span>
                <span className="font-semibold">12 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Next Available</span>
                <span className="font-semibold text-success">3:30 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}