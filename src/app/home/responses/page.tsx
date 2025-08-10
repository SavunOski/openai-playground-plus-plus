'use client';

import { LoadingSVG } from '@/components/svgs/LoadingSVG';
import {
  Button,
  Input,
  Label,
  Link,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Text,
  Textarea,
} from '@/components/ui';
import { DEFAULT_SYSTEM_INSTRUCTIONS } from '@/lib/constants';
import openai from '@/lib/openai';
import { cn } from '@/lib/utils';
import { ArrowUpRight, MessageSquare, Send, XCircle } from 'lucide-react';
//import { Messages } from 'openai/resources/beta/threads/messages/messages.mjs';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const url = 'https://api.openai.com/v1/responses';
const models =
  [
  { name: 'gpt-5' },
  { name: 'gpt-5-mini' },
  { name: 'gpt-5-nano' },
  { name: 'o4-mini' },
  { name: 'o3-pro' },
  { name: 'o3' },
  { name: 'o3-mini' },
  { name: 'o1-pro' },
  { name: 'o1' },
  { name: 'o1-mini' },
  { name: 'chatgpt-4o-latest' },
  { name: 'gpt-4.1' },
  { name: 'gpt-4.1-mini' },
  { name: 'gpt-4.1-nano' },
  { name: 'computer-use-preview' }];

const efforts =
  [
  { name: 'minimal' },
  { name: 'low' },
  { name: 'medium' },
  { name: 'high' },];

const TextGeneration = () => {
  const [systemInstructions, setSystemInstructions] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [pendingCompletion, setPendingCompletion] = useState<boolean>(false);
  const [options, setOptions] = useState<{
    model: string;
    temperature: number;
    reasoning: string;
  }>({
    model: models[0].name,
    temperature: 1,
    reasoning: "low",
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  var isEffort = options.model === 'gpt-5' || options.model === 'gpt-5-mini' || options.model === 'gpt-5-nano' ? true : false;
  async function getResponse(
    messages: Array<ChatCompletionMessageParam>
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + openai.apiKey,
        },
        body: JSON.stringify({
          input: messages,
          model: options.model,
          temperature: options.temperature,
          truncation: options.model === 'computer-use-preview' ? "auto" : "disabled",
          reasoning: "{effort: " + (options.model === 'gpt-5' || options.model === 'gpt-5-mini' || options.model === 'gpt-5-nano' ? null : options.reasoning) + "}",
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // return json
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  const handleSend = () => {
    if (inputMessage.startsWith("/setmodel") || inputMessage.startsWith("/m")){
      const model = inputMessage.split(" ")[1];      
        setOptions({ ...options, model: model });
        setInputMessage('');
        return;     
    };
    setPendingCompletion(true);
    const newMessages = [...messages];
    newMessages.push({
      role: 'user',
      content: inputMessage,
    });
    setMessages(newMessages);
    setInputMessage('');

    getResponse(newMessages)
      .then((completionResponse) => {
        setMessages((prevMessages) => {
          return [
            ...prevMessages,
            {
              role: 'assistant',
              content: completionResponse.output?.find((item: { type: string; }) => item.type === "message")?.content?.[0]?.text ?? '',
            },
          ];
        });
      })
      .catch((err) => {
        setErrorMessage(err.message);
      })
      .finally(() => {
        setPendingCompletion(false);
      });
  };

  const handleInputMessageKeyUp = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleSend();
      event.preventDefault();
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full w-full flex overflow-hidden px-4 py-6 gap-4">
      <div className="hidden lg:flex flex-col lg:w-1/4 xl:w-1/5 gap-6">
        <div className="flex-1 flex flex-col gap-3">
          <Label>System Message</Label>
          <Textarea
            name="systemMessage"
            className="h-full resize-none"
            placeholder={DEFAULT_SYSTEM_INSTRUCTIONS}
            onChange={(e) => setSystemInstructions(e.target.value)}
            value={systemInstructions}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          {/*for mobile */}
          <div className="lg:hidden flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-3">
              <Label>Model</Label>
              <Select
                name="model"
                value={options.model}
                onValueChange={(value) =>
                  setOptions({ ...options, model: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model, index) => (
                    <SelectItem key={index} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEffort && 
              <div className="flex flex-col gap-3">
                <Label>Reasoning Effort</Label>
                <Select
                  name="reasoning"
                  value={options.reasoning}
                  onValueChange={(value) =>
                  setOptions({ ...options, reasoning: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reasoning effort" />
                </SelectTrigger>
                <SelectContent>
                  {efforts.map((reason, index) => (
                    <SelectItem key={index} value={reason.name}>
                      {reason.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>}

            {!isEffort && <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Label>Temperature: {options.temperature}</Label>
              </div>
              <Slider
                name="temperature"
                value={[options.temperature]}
                max={2}
                step={0.01}
                onValueChange={(value) =>
                  setOptions({ ...options, temperature: value[0] })
                }
              />
            </div>}
          </div>

          {messages.length === 0 && (
            <div className="w-full h-full flex flex-col justify-center items-center gap-3">
              <MessageSquare />
              <Text variant="medium">Send a message to start your chat</Text>
            </div>
          )}
          {messages
            .filter((m) => m.role != 'system')
            .map((message, index) => (
              <Text
                key={index}
                className={cn(
                  'p-3 border rounded-md w-fit',
                  message.role === 'assistant' && 'bg-secondary',
                  message.role === 'user' && 'ml-auto'
                )}
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {message.content as string}
                </Markdown>
              </Text>
            ))}
          {pendingCompletion && (
            <div className="p-3 border rounded w-fit bg-secondary">
              <LoadingSVG />
            </div>
          )}
          {errorMessage && (
            <div className="w-full h-full flex flex-col justify-center items-center gap-4 text-red-500">
              <XCircle />
              <Text className="">{errorMessage}</Text>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-4">
          <Input
            name="inputMessage"
            className="flex-1"
            placeholder="Enter your message or /setmodel <model> to set a model, even if not listed"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={handleInputMessageKeyUp}
          />
          <Button onClick={handleSend}>
            <Send size={18} />
          </Button>
        </div>
      </div>
      <div className="hidden lg:flex flex-col lg:w-1/4 xl:w-1/5 gap-6">
        <div className="flex flex-col gap-3">
          <Label>Model</Label>
          <Select
            name="model"
            value={options.model}
            onValueChange={(value) => setOptions({ ...options, model: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model, index) => (
                <SelectItem key={index} value={model.name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isEffort && <div className="flex flex-col gap-3">
          <Label>Reasoning Effort</Label>
          <Select
            name="reasoning"
            value={options.reasoning}
            onValueChange={(value) => setOptions({ ...options, reasoning: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reasoning effort" />
            </SelectTrigger>
            <SelectContent>
              {efforts.map((reason, index) => (
                <SelectItem key={index} value={reason.name}>
                  {reason.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>}
        {!isEffort && <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Label>Temperature</Label>
            <Text variant="medium">{options.temperature}</Text>
          </div>
          <Slider
            name="temperature"
            value={[options.temperature]}
            max={2}
            step={0.01}
            onValueChange={(value) =>
              setOptions({ ...options, temperature: value[0] })
            }
          />
        </div>}
        <Link
          href="https://platform.openai.com/docs/guides/text-generation"
          target="_blank"
        >
          Learn more about text generation <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default TextGeneration;
