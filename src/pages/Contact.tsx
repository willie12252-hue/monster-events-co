import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-contact-controlroom.webp";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAppData } from "@/contexts/DataContext";
import { buildQuoteEmailMessage, canSendEmail, sendEmailJs } from "@/lib/emailjs";
import NextStepCTA from "@/components/NextStepCTA";
import { isValidEmail, isValidPhone } from "@/lib/validate";
import { MessageCircle, Phone, Mail, ShieldAlert, MapPin, Printer } from "lucide-react";
import lineQr from "@/assets/line-qr.webp";
import { useMemo, useState } from "react";


export default function Contact() {
  const { data } = useAppData();
  const [company, setCompany] = useState("");
  const [vat, setVat] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventName, setEventName] = useState("");


  const [inDate, setInDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outDate, setOutDate] = useState("");
  const [outTime, setOutTime] = useState("");


  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");


  const [need, setNeed] = useState("");
  const [note, setNote] = useState("");


  const [sending, setSending] = useState(false);


  const TIME_OPTIONS = useMemo(() => {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of ["00", "15", "30", "45"]) {
        out.push(String(h).padStart(2, "0") + ":" + m);
      }
    }
    return out;
  }, []);


  const CITY_OPTIONS = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣",
    "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣",
    "澎湖縣", "金門縣", "連江縣"
  ];


  const submit = async () => {
    if (!company.trim() || !name.trim() || (!phone.trim() && !email.trim())) {
