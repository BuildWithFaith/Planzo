"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { X, MessageCircle, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChat } from "@ai-sdk/react";

export default function ChatBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, reload, error } = useChat({
    api: "/api/gemini",
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowChatIcon(window.scrollY > 200);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen z-50">
      {/* Chat Icon */}
      <AnimatePresence>
        {showChatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              onClick={toggleChat}
              size="icon"
              className="rounded-full p-2 shadow-lg transition-transform transform hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Box */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-16 right-4 z-50 w-[90%] md:w-[500px] backdrop-blur-md"
          >
            <Card className="border border-white/30 shadow-lg rounded-lg p-2">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">Planzo AI</CardTitle>
                <Button onClick={toggleChat} size="sm" variant="ghost">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close Chat</span>
                </Button>
              </CardHeader>

              {/* Chat Messages */}
              <CardContent>
                <div
                  ref={chatContainerRef}
                  className="h-[320px] overflow-y-auto overflow-x-hidden p-4 space-y-3 scroll-smooth scrollbar-thin scrollbar-thumb-blue-500/70 scrollbar-track-white/70 scrollbar-corner-white"
                >
                  {messages?.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-500 flex justify-center items-center"
                    >
                      No messages yet
                    </motion.div>
                  )}
                  {messages?.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: message.role === "user" ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, type: "spring", stiffness: 200 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg break-words ${message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                          } transition-all duration-200`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, href, children, ...props }) => {
                              const isExternal = href && (href.startsWith('http') || href.startsWith('www'));
                              return (
                                <a 
                                  href={href}
                                  {...props}
                                  className={`
                                    text-blue-600 hover:text-blue-800 
                                    transition-colors duration-200 
                                    ${isExternal ? 'after:content-["↗"] after:ml-1 after:text-sm after:text-gray-500' : ''}
                                  `}
                                  target={isExternal ? '_blank' : undefined}
                                  rel={isExternal ? 'noopener noreferrer' : undefined}
                                >
                                  {children}
                                </a>
                              );
                            },
                            code({ inline, children, ...props }: { inline?: boolean, children?: React.ReactNode }) {
                              return inline ? (
                                <code {...props} className="bg-gray-200 px-1 rounded text-red-600">
                                  {children}
                                </code>
                              ) : (
                                <pre {...props} className="bg-gray-200 p-2 rounded overflow-x-auto">
                                  <code className="text-sm">{children}</code>
                                </pre>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center items-center space-x-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-gray-500">Loading...</span>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center items-center space-x-2 bg-red-100 p-2 rounded"
                    >
                      <span className="text-red-300 font-semibold">An error occurred.</span>
                      <button
                        type="button"
                        onClick={() => reload()}
                        className="underline text-blue-600"
                      >
                        Retry
                      </button>
                    </motion.div>
                  )}
                </div>
              </CardContent>


              {/* Input */}
              <CardFooter>
                <form
                  onSubmit={handleSubmit}
                  className="flex w-full items-center mt-2 pl-5 space-x-3"
                >
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg focus:outline-none bg-white/10 placeholder:text-black/60"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="icon"
                    className="transition-transform transform hover:scale-105 active:scale-95 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-full"
                  >
                    <Send className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </Button>


                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
