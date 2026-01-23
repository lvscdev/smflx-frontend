'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, User, Users, Briefcase, Home as HomeIcon, Heart, Search, ChevronDown, X } from 'lucide-react';
import iso3166_2 from "iso-3166-2.json";

const dialCodes = [
  { code: "+93", label: "🇦🇫 +93" },   
  { code: "+355", label: "🇦🇱 +355" },
  { code: "+213", label: "🇩🇿 +213" }, 
  { code: "+1-684", label: "🇦🇸 +1-684" }, 
  { code: "+376", label: "🇦🇩 +376" }, 
  { code: "+244", label: "🇦🇴 +244" }, 
  { code: "+1-264", label: "🇦🇮 +1-264" }, 
  { code: "+672", label: "🇦🇶 +672" }, 
  { code: "+1-268", label: "🇦🇬 +1-268" }, 
  { code: "+54", label: "🇦🇷 +54" }, 
  { code: "+374", label: "🇦🇲 +374" }, 
  { code: "+297", label: "🇦🇼 +297" }, 
  { code: "+61", label: "🇦🇺 +61" }, 
  { code: "+43", label: "🇦🇹 +43" }, 
  { code: "+994", label: "🇦🇿 +994" }, 
  { code: "+1-242", label: "🇧🇸 +1-242" }, 
  { code: "+973", label: "🇧🇭 +973" }, 
  { code: "+880", label: "🇧🇩 +880" }, 
  { code: "+1-246", label: "🇧🇧 +1-246" }, 
  { code: "+375", label: "🇧🇾 +375" }, 
  { code: "+32", label: "🇧🇪 +32" }, 
  { code: "+501", label: "🇧🇿 +501" }, 
  { code: "+229", label: "🇧🇯 +229" }, 
  { code: "+1-441", label: "🇧🇲 +1-441" }, 
  { code: "+975", label: "🇧🇹 +975" }, 
  { code: "+591", label: "🇧🇴 +591" }, 
  { code: "+387", label: "🇧🇦 +387" }, 
  { code: "+267", label: "🇧🇼 +267" }, 
  { code: "+55", label: "🇧🇷 +55" }, 
  { code: "+246", label: "🇮🇴 +246" }, 
  { code: "+673", label: "🇧🇳 +673" }, 
  { code: "+359", label: "🇧🇬 +359" }, 
  { code: "+226", label: "🇧🇫 +226" }, 
  { code: "+257", label: "🇧🇮 +257" }, 
  { code: "+855", label: "🇰🇭 +855" }, 
  { code: "+237", label: "🇨🇲 +237" }, 
  { code: "+1", label: "🇨🇦 +1" }, 
  { code: "+238", label: "🇨🇻 +238" }, 
  { code: "+1-345", label: "🇰🇾 +1-345" }, 
  { code: "+236", label: "🇨🇫 +236" },
  { code: "+235", label: "🇹🇩 +235" }, 
  { code: "+56", label: "🇨🇱 +56" },
  { code: "+86", label: "🇨🇳 +86" }, 
  { code: "+57", label: "🇨🇴 +57" }, 
  { code: "+269", label: "🇰🇲 +269" }, 
  { code: "+242", label: "🇨🇬 +242" }, 
  { code: "+243", label: "🇨🇩 +243" }, 
  { code: "+506", label: "🇨🇷 +506" }, 
  { code: "+225", label: "🇨🇮 +225" },
  { code: "+385", label: "🇭🇷 +385" }, 
  { code: "+53", label: "🇨🇺 +53" }, 
  { code: "+357", label: "🇨🇾 +357" }, 
  { code: "+420", label: "🇨🇿 +420" }, 
  { code: "+45", label: "🇩🇰 +45" }, 
  { code: "+253", label: "🇩🇯 +253" }, 
  { code: "+1-767", label: "🇩🇲 +1-767" }, 
  { code: "+1-809", label: "🇩🇴 +1-809" }, 
  { code: "+593", label: "🇪🇨 +593" }, 
  { code: "+20", label: "🇪🇬 +20" }, 
  { code: "+503", label: "🇸🇻 +503" }, 
  { code: "+240", label: "🇬🇶 +240" }, 
  { code: "+291", label: "🇪🇷 +291" }, 
  { code: "+372", label: "🇪🇪 +372" }, 
  { code: "+251", label: "🇪🇹 +251" }, 
  { code: "+358", label: "🇫🇮 +358" }, 
  { code: "+33", label: "🇫🇷 +33" }, 
  { code: "+49", label: "🇩🇪 +49" }, 
  { code: "+233", label: "🇬🇭 +233" }, 
  { code: "+30", label: "🇬🇷 +30" }, 
  { code: "+299", label: "🇬🇱 +299" }, 
  { code: "+1-473", label: "🇬🇩 +1-473" }, 
  { code: "+852", label: "🇭🇰 +852" }, 
  { code: "+36", label: "🇭🇺 +36" }, 
  { code: "+91", label: "🇮🇳 +91" }, 
  { code: "+62", label: "🇮🇩 +62" }, 
  { code: "+98", label: "🇮🇷 +98" }, 
  { code: "+964", label: "🇮🇶 +964" }, 
  { code: "+353", label: "🇮🇪 +353" }, 
  { code: "+972", label: "🇮🇱 +972" }, 
  { code: "+39", label: "🇮🇹 +39" }, 
  { code: "+81", label: "🇯🇵 +81" }, 
  { code: "+254", label: "🇰🇪 +254" }, 
  { code: "+82", label: "🇰🇷 +82" }, 
  { code: "+961", label: "🇱🇧 +961" }, 
  { code: "+231", label: "🇱🇷 +231" }, 
  { code: "+218", label: "🇱🇾 +218" }, 
  { code: "+60", label: "🇲🇾 +60" }, 
  { code: "+234", label: "🇳🇬 +234" }, 
  { code: "+212", label: "🇲🇦 +212" }, 
  { code: "+31", label: "🇳🇱 +31" }, 
  { code: "+64", label: "🇳🇿 +64" }, 
  { code: "+47", label: "🇳🇴 +47" }, 
  { code: "+92", label: "🇵🇰 +92" }, 
  { code: "+63", label: "🇵🇭 +63" }, 
  { code: "+48", label: "🇵🇱 +48" }, 
  { code: "+351", label: "🇵🇹 +351" }, 
  { code: "+974", label: "🇶🇦 +974" }, 
  { code: "+40", label: "🇷🇴 +40" }, 
  { code: "+7", label: "🇷🇺 +7" }, 
  { code: "+966", label: "🇸🇦 +966" }, 
  { code: "+221", label: "🇸🇳 +221" }, 
  { code: "+65", label: "🇸🇬 +65" }, 
  { code: "+27", label: "🇿🇦 +27" }, 
  { code: "+34", label: "🇪🇸 +34" }, 
  { code: "+94", label: "🇱🇰 +94" }, 
  { code: "+46", label: "🇸🇪 +46" }, 
  { code: "+41", label: "🇨🇭 +41" },
  { code: "+66", label: "🇹🇭 +66" }, 
  { code: "+90", label: "🇹🇷 +90" }, 
  { code: "+256", label: "🇺🇬 +256" }, 
  { code: "+380", label: "🇺🇦 +380" }, 
  { code: "+971", label: "🇦🇪 +971" }, 
  { code: "+44", label: "🇬🇧 +44" }, 
  { code: "+1", label: "🇺🇸 +1" }, 
  { code: "+84", label: "🇻🇳 +84" }, 
  { code: "+260", label: "🇿🇲 +260" }, 
  { code: "+263", label: "🇿🇼 +263" }, 
];

const countries = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
];

const ageRanges = [
  { value: '0-12', label: '0-12 (Lively Kiddles)' },
  { value: '13-19', label: '13-19 (Teens)' },
  { value: '20-22', label: '20-22 (Young Adults)' },
  { value: '23-29', label: 'Less than 30 (23-29)' },
  { value: '30-39', label: 'Less than 40 (30-39)' },
  { value: '40+', label: '40+ (Elders)' },
];

const countryStates: Record<string, string[]> = {
  'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'],
  'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'South Australia', 'Western Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'],
  'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
  'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'],
  'Ghana': ['Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Western'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega'],
};

interface ProfileData {
  fullName: string;
  phoneCountryCode?: string;
  phoneNumber: string; 
  phone?: string; 
  gender: string;
  ageRange: string;
  country: string;
  state: string;
  localAssembly: string;
  address: string;
  isMinister: string;
  employmentStatus: string;
  maritalStatus: string;
  spouseName?: string;
  isYAT?: boolean;
}

interface ProfileFormProps {
  onComplete: (profile: ProfileData) => void;
  onBack: () => void;
  initialData?: ProfileData | null;
}

interface GridOptionProps {
  value: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  description?: string;
}

function GridOption({ value, selected, onClick, icon, label, description }: GridOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-300 text-left bg-white ${
        selected
          ? 'border-gray-700 shadow-sm'
          : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <div className="flex items-start gap-2.5">
        {icon && <div className={`mt-0.5 ${selected ? 'text-gray-700' : 'text-gray-400'}`}>{icon}</div>}
        <div className="flex-1">
          <div className={`text-sm font-medium mb-0.5 ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
            {label}
          </div>
          {description && (
            <div className="text-xs text-gray-500">
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function ProfileForm({ onComplete, onBack, initialData }: ProfileFormProps) {
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (initialData) {
      return {
        ...initialData,
        phoneCountryCode:
          initialData.phoneCountryCode ||
          (typeof initialData.phone === 'string' && initialData.phone.startsWith('+')
            ? initialData.phone.match(/^\+\d{1,4}/)?.[0]
            : undefined) ||
          '+234',
        phoneNumber:
          initialData.phoneNumber
            ? initialData.phoneNumber.startsWith('+')
              ? initialData.phoneNumber.replace(/^\+\d{1,4}/, '')
              : initialData.phoneNumber
            : typeof initialData.phone === 'string'
            ? initialData.phone.replace(/^\+\d{1,4}/, '')
            : '',
      };
    }
    return {
      fullName: '',
      phoneCountryCode: '+234',
      phoneNumber: '',
      gender: '',
      ageRange: '',
      country: '',
      state: '',
      localAssembly: '',
      address: '',
      isMinister: '',
      employmentStatus: '',
      maritalStatus: '',
      spouseName: '',
      isYAT: false,
    };
  });

  const [isYAT, setIsYAT] = useState(initialData?.isYAT || false);

  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [stateSearch, setStateSearch] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Get states for selected country and filter based on search
  const availableStates = countryStates[profile.country] || [];
  const filteredStates = availableStates.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = profile.phoneCountryCode || "+234";
    const local = (profile.phoneNumber || "").trim();
    const full = (code + local).replace(/\s+/g, "");
    onComplete({ ...profile, phoneCountryCode: code, phoneNumber: local, phone: full });
  };

  const isFormValid = () => {
    const requiredFields = [
      'fullName',
      'phoneNumber',
      'gender',
      'ageRange',
      'country',
      'state',
      'localAssembly',
      'address',
      'isMinister',
      'employmentStatus',
      'maritalStatus',
    ];
    
    const allFieldsFilled = requiredFields.every(field => profile[field as keyof ProfileData]);
    
    if (profile.maritalStatus === 'married' && !profile.spouseName) {
      return false;
    }
    
    return allFieldsFilled;
  };

  return (
    <div className="flex-1 overflow-auto px-4 lg:px-[32px] py-8 lg:py-[60.32px] lg:pt-[72px] lg:pr-[32px] lg:pb-[32px] lg:pl-[32px]">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 text-sm">
            Please provide your personal details for registration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm text-gray-700 font-medium">Full Name *</label>
            <input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Gender - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Gender *</label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption
                value="male"
                selected={profile.gender === 'male'}
                onClick={() => setProfile({ ...profile, gender: 'male' })}
                icon={
                  <User className="w-5 h-5" />
                }
                label="Male"
                description="Select if you identify as male"
              />
              <GridOption
                value="female"
                selected={profile.gender === 'female'}
                onClick={() => setProfile({ ...profile, gender: 'female' })}
                icon={
                  <User className="w-5 h-5" />
                }
                label="Female"
                description="Select if you identify as female"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Phone Number *</label>
            <div className="flex gap-3">
              <select
                value={profile.phoneCountryCode || "+234"}
                onChange={(e) => setProfile({ ...profile, phoneCountryCode: e.target.value })}
                className="h-10 w-[140px] rounded-md border border-gray-200 bg-white px-3 text-sm"
              >
                {dialCodes.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.label}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                value={profile.phoneNumber || ""}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                placeholder="8012345678"
                className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <label htmlFor="ageRange" className="block text-sm text-gray-700 font-medium">Age Range *</label>
            <select
              id="ageRange"
              value={profile.ageRange}
              onChange={(e) => {
                setProfile({ ...profile, ageRange: e.target.value });
                // Reset isYAT if not 20-22
                if (e.target.value !== '20-22' && e.target.value !== '13-19') {
                  setIsYAT(false);
                  setProfile({ ...profile, ageRange: e.target.value, isYAT: false });
                }
                // Automatically set isYAT to true for 13-19
                if (e.target.value === '13-19') {
                  setIsYAT(true);
                  setProfile({ ...profile, ageRange: e.target.value, isYAT: true });
                }
              }}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Select age range</option>
              {ageRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* YAT Checkbox - Only show for 20-22 age range */}
          {profile.ageRange === '20-22' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isYAT}
                  onChange={(e) => {
                    setIsYAT(e.target.checked);
                    setProfile({ ...profile, isYAT: e.target.checked });
                  }}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Are you among Young Adults and Teens? (If yes, you will be eligible for YAT Camp Meeting)
                </span>
              </label>
            </div>
          )}

          {/* Country */}
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm text-gray-700 font-medium">Country *</label>
            <div className="relative" ref={countryDropdownRef}>
              <input
                id="country"
                value={profile.country}
                readOnly
                placeholder="Select your country"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                onClick={() => {
                  setIsCountryDropdownOpen(!isCountryDropdownOpen);
                  setCountrySearch('');
                }}
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              {isCountryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search countries..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setProfile({ ...profile, country: country.name, state: '' });
                            setIsCountryDropdownOpen(false);
                            setCountrySearch('');
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm">{country.name}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label htmlFor="state" className="block text-sm text-gray-700 font-medium">State of Residence *</label>
            <div className="relative" ref={stateDropdownRef}>
              <input
                id="state"
                value={profile.state}
                readOnly
                placeholder="Select your state"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
                onClick={() => {
                  if (availableStates.length > 0) {
                    setIsStateDropdownOpen(!isStateDropdownOpen);
                    setStateSearch('');
                  }
                }}
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
              {isStateDropdownOpen && availableStates.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        placeholder="Search states..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((state) => (
                        <div
                          key={state}
                          className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setProfile({ ...profile, state: state });
                            setIsStateDropdownOpen(false);
                            setStateSearch('');
                          }}
                        >
                          <span className="text-sm">{state}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No states found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Local Assembly */}
          <div className="space-y-2">
            <label htmlFor="localAssembly" className="block text-sm text-gray-700 font-medium">Local Assembly *</label>
            <input
              id="localAssembly"
              value={profile.localAssembly}
              onChange={(e) => setProfile({ ...profile, localAssembly: e.target.value })}
              placeholder="Enter your local assembly"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Residential Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm text-gray-700 font-medium">Residential Address *</label>
            <input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Enter your residential address"
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Are you a Minister - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Are you a Minister? *</label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption
                value="yes"
                selected={profile.isMinister === 'yes'}
                onClick={() => setProfile({ ...profile, isMinister: 'yes' })}
                icon={<User className="w-5 h-5" />}
                label="Yes"
                description="I serve as a minister"
              />
              <GridOption
                value="no"
                selected={profile.isMinister === 'no'}
                onClick={() => setProfile({ ...profile, isMinister: 'no' })}
                icon={<Users className="w-5 h-5" />}
                label="No"
                description="I'm a church member"
              />
            </div>
          </div>

          {/* Employment Status - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Employment Status *</label>
            <div className="grid grid-cols-3 gap-3">
              <GridOption
                value="employed"
                selected={profile.employmentStatus === 'employed'}
                onClick={() => setProfile({ ...profile, employmentStatus: 'employed' })}
                icon={<Briefcase className="w-5 h-5" />}
                label="Employed"
                description="Currently working"
              />
              <GridOption
                value="unemployed"
                selected={profile.employmentStatus === 'unemployed'}
                onClick={() => setProfile({ ...profile, employmentStatus: 'unemployed' })}
                icon={<HomeIcon className="w-5 h-5" />}
                label="Unemployed"
                description="Not working"
              />
              <GridOption
                value="student"
                selected={profile.employmentStatus === 'student'}
                onClick={() => setProfile({ ...profile, employmentStatus: 'student' })}
                icon={<User className="w-5 h-5" />}
                label="Student"
                description="In school/college"
              />
            </div>
          </div>

          {/* Marital Status - Grid Selector */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 font-medium">Marital Status *</label>
            <div className="grid grid-cols-2 gap-3">
              <GridOption
                value="single"
                selected={profile.maritalStatus === 'single'}
                onClick={() => setProfile({ ...profile, maritalStatus: 'single' })}
                icon={<User className="w-5 h-5" />}
                label="Single"
                description="Not married"
              />
              <GridOption
                value="married"
                selected={profile.maritalStatus === 'married'}
                onClick={() => setProfile({ ...profile, maritalStatus: 'married' })}
                icon={<Heart className="w-5 h-5" />}
                label="Married"
                description="Currently married"
              />
            </div>
          </div>

          {/* Spouse Name - Conditional */}
          {profile.maritalStatus === 'married' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="spouseName" className="block text-sm text-gray-700 font-medium">Spouse&apos;s Name *</label>
              <input
                id="spouseName"
                value={profile.spouseName}
                onChange={(e) => setProfile({ ...profile, spouseName: e.target.value })}
                placeholder="Enter spouse's name"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`flex-1 py-3 rounded-lg transition-colors ${
                isFormValid()
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Profile & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}