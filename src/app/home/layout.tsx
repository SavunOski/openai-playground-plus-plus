'use client';

import { redirect, usePathname, useRouter } from 'next/navigation';
import { HTMLAttributeAnchorTarget, PropsWithChildren, useEffect } from 'react';
import { OpenAISVG, GithubSVG } from '@/components/svgs';
import { OPENAI_API_KEY } from '@/lib/constants';
import openai from '@/lib/openai';
import { ArrowUpRight } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Button,
  Link,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@/components/ui';

type Menu = { name: string; path: string; target?: HTMLAttributeAnchorTarget };

const menus: Menu[] = [
  {
    name: 'Completion',
    path: '/home/completion',
  },
  {
    name: 'Text',
    path: '/home/text',
  },
  {
    name: 'Reasoning',
    path: '/home/reason',
  },
  {
    name: 'Responses',
    path: '/home/responses',
  },
  {
    name: 'Vision',
    path: '/home/vision',
  },
  {
    name: 'Images',
    path: '/home/images',
  },
  {
    name: 'Whisper',
    path: '/home/whisper',
  },
  {
    name: 'Assistants',
    path: '/home/assistants',
  },
  {
    name: 'Moderations',
    path: '/home/moderations',
  },
  {
    name: 'Tokenizer',
    path: '/home/tokenizer',
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const activeMenu: Menu = menus.find((menu) => menu.path === pathname)!;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b gap-8">
      <Link variant="ghost" href="/">
        <OpenAISVG width="24" height="24" className="mr-2" />
        <Text variant="heading">Playground Plus Plus</Text>
      </Link>
      <div className="flex gap-4 overflow-auto">
        <div className="hidden lg:flex gap-4 overflow-auto">
          {menus.map((menu, index) => (
            <Button
              key={index}
              asChild
              size="small"
              variant={menu === activeMenu ? 'secondary' : 'ghost'}
            >
              <Link href={menu.path} target={menu.target} variant="ghost">
                {menu.name}
              </Link>
            </Button>
          ))}
        </div>
        <div className="lg:hidden flex gap-4 overflow-auto">
          <div id="selectBar" className="flex flex-col gap-3">
            <Select
              name="page"
              // value={menu.name}
              onValueChange={(value) => {
                const selectedMenu = menus.find((menu) => menu.name === value);
                if (selectedMenu) {
                  redirect(selectedMenu.path);
                }
              }}
            >
              {' '}
              <SelectTrigger>
                <SelectValue placeholder="menu.name" />
              </SelectTrigger>
              <SelectContent>
                {menus.map((model, index) => (
                  <SelectItem key={index} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Link
          href="https://platform.openai.com/docs/api-reference"
          target="_blank"
        >
          API Reference <ArrowUpRight size={16} />
        </Link>
        <ModeToggle />
        <Link
          href="https://github.com/hkurma/openai-playground-plus"
          target="_blank"
        >
          <GithubSVG width="26" height="26" />
        </Link>
      </div>
    </div>
  );
};

const HomeLayout = (props: PropsWithChildren) => {
  const router = useRouter();

  useEffect(() => {
    const apiKey = localStorage.getItem(OPENAI_API_KEY);
    if (!apiKey) router.push('/');
    else openai.apiKey = apiKey;
  }, [router]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-auto">{props.children}</div>
    </div>
  );
};

export default HomeLayout;
