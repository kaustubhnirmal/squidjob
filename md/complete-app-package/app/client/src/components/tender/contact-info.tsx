import React, { useState } from "react";
import { Phone, Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ContactInfoProps {
  phoneNumber: string;
  contactName?: string;
  email?: string;
}

export function ContactInfo({ phoneNumber, contactName, email }: ContactInfoProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    toast({
      title: "Phone number copied",
      description: `${phoneNumber} has been copied to your clipboard.`,
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <span className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-blue-600">
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View contact information</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-4" side="top">
          <div className="space-y-2">
            {contactName && (
              <div className="text-sm">
                <span className="font-semibold">Name:</span> {contactName}
              </div>
            )}
            <div className="text-sm">
              <span className="font-semibold">Phone:</span> {phoneNumber}
            </div>
            {email && (
              <div className="text-sm">
                <span className="font-semibold">Email:</span> {email}
              </div>
            )}
            <div className="flex space-x-2 mt-2">
              {isMobile ? (
                <a href={`tel:${phoneNumber}`} className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-xs">
                  <Phone className="h-3 w-3 mr-1" /> Call
                </a>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center px-3 py-1 text-xs"
                  onClick={handleCopyClick}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}