'use client';

import { useEffect, useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Card,
  Divider,
  useDisclosure,
  Spinner,
} from '@nextui-org/react';
import { TypeBox } from '@/components/extras/TypeBox';
import Upload from '@/components/extras/Upload';
import { ExpandableCardDemo } from '@/components/extras/DocumentCards';
import ChatSpace from '@/components/extras/ChatSpace';
import Image from 'next/image';
import Link from 'next/link';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import ChatHistory from '@/components/extras/ChatHistory';
import axios from 'axios';
import { getAllDocuments, uploadDocument } from '@/firebase/functions';
import { toast, ToastContainer } from 'react-toastify';


export default function Home() {
const [title,setTitle] = useState("");
const [loading, SetLoading] = useState(false);

const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState('Choose a model');
  const [documents, setDocuments] = useState([
    {
      description: " Based on the provided context, I can give you a one-line description of what it's about. The content appears to be discussing the impact of changing demographics, specifically the growing middle class and young population, on consumer behavior and trends in the fast-moving consumer goods (FMCG) industry in 2023.",
      title: "Indian-FMCG-Industry-Presentation[1]",
      content: " Based on the provided context about changing demographics, I can give you a summary that covers the key points.\n\nThe report highlights how the growing middle class and young population are driving consumption in various industries. To stay ahead of this trend, companies need to adapt to new consumer behaviors and preferences.\n\nIn terms of FMCG trends and innovations in 2023, sustainability, customer experience, digitalization, data analytics, and business development are expected to play a significant role. The report also mentions intelligence, e-commerce, blockchain, and opening up new opportunities as important areas to focus on.\n\nSome specific statistics mentioned in the report include:\n\n* 16% growth in the FMCG industry\n* 65% of consumers prioritizing sustainability when making purchasing decisions\n* 10% increase in e-commerce sales\n* 3% growth in blockchain-based transactions\n\nOverall, the report emphasizes the importance of understanding changing demographics and adapting to new trends and technologies to remain competitive in the market.\n\nPlease note that some sections of the text appear to be incomplete or unclear, which may affect the accuracy of my summary.",
      fileName: "Indian-FMCG-Industry-Presentation[1].pptx"
    }
  ]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' },
  ]);


const handleSaveChat = async () => {
    if (messages.length > 1) {
      try {
        await uploadDocument(title,messages,selectedDocuments,modelType);
        toast.success('Chat saved successfully!');
      } catch (error) {
        console.error('Error saving chat:', error);
        toast.error('Failed to save chat. Please try again.');
      }
    } else {
      toast.info('Please have a conversation first.');
    }
  };

  // useEffect(() => {
  //   console.log('Documents', selectedDocuments);
  // }, [selectedDocuments])

  
  const handlePromptSubmit = async (text) => {

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text },
      // { sender: 'bot', text: `You said: ${text}` },
    ]);

    const fileNames = selectedDocuments.map((doc) => doc.fileName);


    const formData = {
      query: text,
      fileName: fileNames,
    };


    try {
      SetLoading(true);
      const response = await axios.post('http://localhost:5001/response', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      SetLoading(false);

      console.log('API Response:', response.data);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `API Response: ${response.data.response}` },
      ]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const [history, setHistory] = useState(
    [
      {
        title: "First history",
        chathistory: [],
      },
      {
        title: "Second history",
        chathistory: [],
      },
      {
        title: "Third history",
        chathistory: []
      }]
  );


  useEffect(() => {
    const fetchData = async () => {
      try {

        const chatsArray = await getAllDocuments();
        setHistory(chatsArray)
      } catch (e) {
        console.log(e);
      }


    };

    // Call the async function immediately
    fetchData();
  }, []);

  return (
    <main className="flex flex-col p-4 md:flex-row h-screen gap-3 bg-gradient-to-br from-[#000000] to-[#130F40]">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Spinner size="xl" />
        </div>
      )}
      <div className="flex flex-col gap-2 w-full md:w-1/5 p-4 bg-white/10 backdrop-blur-xl shadow-lg ring-1 ring-black/5 overflow-y-auto rounded-2xl">
        <h1 className="text-3xl font-serif mb-4 mt-2 ml-1 text-white">Simplify.io</h1>
        <div className="flex flex-col justify-between h-full">
          <Upload setDocuments={setDocuments} />
          <Divider className="mt-3 bg-gray-600" />
          <ChatHistory chathistory={history} setHistory={setHistory} setMessages={setMessages} setModelType={setModelType} setSelectedDocuments={setSelectedDocuments} />
          <Dropdown className="bg-[#080621]">
            <DropdownTrigger>
              <Button variant="" className="bg-blue-500 py-4 text-white hover:bg-indigo-500">
                {modelType}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Model Selection"
              className="bg-[#080621] text-white font- "
              css={{
                backgroundColor: '#130F40',
                '.nextui-dropdown-item': {
                  '&:hover': {
                    backgroundColor: '#130F40',
                  },
                },
              }}
              onAction={(key) => setModelType(key)}
            >
              <DropdownItem key="llama-3">llama-3</DropdownItem>
              <DropdownItem key="gpt-3.5 turbo">gpt-3.5 turbo</DropdownItem>
              <DropdownItem key="gemini">gemini</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="flex-1 p-4 bg-white/5 backdrop-blur-xl shadow-2xl ring-1 ring-black/10 flex flex-col relative overflow-y-auto rounded-2xl">
        <div className="absolute inset-0 flex flex-col justify-end font- ">
          {modelType != 'Choose a model' && selectedDocuments.length > 0 ? (
            <div className="flex flex-col justify-center items-center mb-5 ">
              <ChatSpace messages={messages} />
              <div className="w-[90%] align-bottom flex justify-center items-center">
                <TypeBox prompt={prompt} setPrompt={setPrompt} onSubmitPrompt={handlePromptSubmit} loading={loading} setTitle={setTitle} />
                <HoverBorderGradient
                  containerClassName=""
                  as="button"
                  className="bg-[#080621] text-white w-50 text-sm font- "
                  onClick={handleSaveChat}
                >
                  SaveChat
                </HoverBorderGradient>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center mb-12 font- ">
              <CardContainer className="inter-var">
                <CardBody className="bg-white/20 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                  <CardItem
                    translateZ="50"
                    className="flex items-center justify-center text-3xl font-bold text-blue-500 font-  dark:text-white"
                  >
                    Welcome Back!
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-gray-200 text-md font-  max-w-sm mt-2 dark:text-white"
                  >
                    Choose a model and the files you want to analyze before proceeding.
                  </CardItem>
                  <CardItem translateZ="100" className="w-full mt-4">
                    <Image
                      src="https://images.unsplash.com/photo-1597733336794-12d05021d510?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      height="1000"
                      width="1000"
                      className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                      alt="thumbnail"
                    />
                  </CardItem>
                  <div className="flex justify-between items-center mt-4">
                    {/* <CardItem
                      as="p"
                      translateZ="60"
                      className="text-white text-sm max-w-sm mt-5 dark:text-neutral-300"
                    >
                      Choose a model and the files you want to analyze before proceeding.
                    </CardItem> */}
                    {/* <CardItem
                      translateZ={20}
                      as={Link}
                      href="https://twitter.com/mannupaaji"
                      target="__blank"
                      className="px-4 py-2 rounded-xl text-xs font-normal text-black"
                    >
                      If you havent signed up yet →
                    </CardItem>
                    <CardItem
                      translateZ={20}
                      as="button"
                      className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                    >
                      Sign up
                    </CardItem> */}
                  </div>
                </CardBody>
              </CardContainer>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full md:w-1/5 p-4 bg-white/10 backdrop-blur-xl shadow-lg ring-1 ring-black/5 overflow-y-auto rounded-2xl">
        <h2 className="text-xl font-  text-blue-500 mt-4">Uploaded Documents</h2>
        <p className='text-sm font- '>You can select multiple files at once!</p>
        <Divider className="mb-3 mt-3 bg-gray-600" />
        {/* document cards */}
        <ExpandableCardDemo
          documents={documents}
          selectedDocuments={selectedDocuments}
          setSelectedDocuments={setSelectedDocuments}
        /> 
      </div>
      <ToastContainer />
    </main>
  );
}
