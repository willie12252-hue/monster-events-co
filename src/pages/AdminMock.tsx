import React, { useEffect, useMemo, useState } from "react";


import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-process-conveyor.webp";


import { useAppData } from "@/contexts/DataContext";
import { seedAllToSupabase } from "@/lib/supabase-store";
import MarkdownEditorPanel from "@/components/MarkdownEditorPanel";


import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { normalizeFootprintToObject } from "@/lib/prop-specs";


import {
  Box,
  BookOpen,
  CalendarDays,
  FileText,
  LogOut,
  Plus,
  Save,
  Search,
  Trash2,
  Wrench,
  Pencil,
  GripVertical,
  Sparkles,
  PlaySquare,
  Mail,
  Download,
  ClipboardList,
} from "lucide-react";


import { toYouTubeEmbedUrl } from "@/lib/youtube";
import emailjs from "@emailjs/browser";
import { rangeDays, toMonthKey } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";


import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
