import { User } from "@supabase/supabase-js";

export type MenuItem = {
    href: string;
    labelKey: string;
    icon?: React.ReactNode;
    roles?: string[];
    children?: MenuItem[];
    visible?: (user: User | null) => boolean;
  };