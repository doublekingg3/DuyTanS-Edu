const fs = require('fs');
let content = fs.readFileSync('src/components/ParentView.tsx', 'utf8');
content = content.replace(
  "import { Bell, BookOpen, User, Calendar, Trophy, AlertCircle, TrendingUp, TrendingDown, Minus, Clock, Medal, AlertTriangle, AlertOctagon, Bot, Loader2, Sparkles, CalendarCheck } from 'lucide-react';",
  "import { Bell, BookOpen, User, Calendar, Trophy, AlertCircle, TrendingUp, TrendingDown, Minus, Clock, Medal, AlertTriangle, AlertOctagon, Bot, Loader2, Sparkles, CalendarCheck, UserCheck, UserX } from 'lucide-react';"
);
fs.writeFileSync('src/components/ParentView.tsx', content);
