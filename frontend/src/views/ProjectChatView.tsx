import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Wallet, MessageSquare, FileText, CheckCircle2, Circle, Paperclip, X, Plus, ShieldCheck, Coins, UploadCloud, UserCircle, Bot, Search, Calendar, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../lib/WalletContext';
import { ethers } from 'ethers';

const ESCROW_ABI: any[] = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_freelancer",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_aiAgent",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_durationDays",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "GRACE_PERIOD",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "LATE_PENALTY_PER_DAY",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "aiAgent",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "approveWork",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimRefund",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deadline",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "employer",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "freelancer",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "freelancerFunded",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "freelancerStake",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "paymentAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rejectWork",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stakeFreelancer",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "state",
        "outputs": [
            {
                "internalType": "enum AIEscrow.ProjectState",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "submissionTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "submitWork",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_newAgent",
                "type": "address"
            }
        ],
        "name": "updateAIAgent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
const ESCROW_BYTECODE = "0x6080604052604051611b85380380611b85833981810160405281019061002591906101ec565b335f5f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508260015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160025f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503460038190555060646005346100fa9190610269565b61010491906102d7565b60048190555062015180816101199190610269565b426101249190610307565b6005819055505f60075f6101000a81548160ff0219169083600481111561014e5761014d61033a565b5b0217905550505050610367565b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6101888261015f565b9050919050565b6101988161017e565b81146101a2575f5ffd5b50565b5f815190506101b38161018f565b92915050565b5f819050919050565b6101cb816101b9565b81146101d5575f5ffd5b50565b5f815190506101e6816101c2565b92915050565b5f5f5f606084860312156102035761020261015b565b5b5f610210868287016101a5565b9350506020610221868287016101a5565b9250506040610232868287016101d8565b9150509250925092565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f610273826101b9565b915061027e836101b9565b925082820261028c816101b9565b915082820484148315176102a3576102a261023c565b5b5092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f6102e1826101b9565b91506102ec836101b9565b9250826102fc576102fb6102aa565b5b828204905092915050565b5f610311826101b9565b915061031c836101b9565b92508282019050808211156103345761033361023c565b5b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602160045260245ffd5b611811806103745f395ff3fe6080604052600436106100fd575f3560e01c8063a6d5b73211610094578063c19d93fb11610063578063c19d93fb146102af578063c1a287e2146102d9578063c35905c614610303578063c7a257771461032d578063ddb3a53214610343576100fd565b8063a6d5b7321461021b578063ae200e7914610245578063b5545a3c1461026f578063bc6a48aa14610285576100fd565b80638bf470fb116100d05780638bf470fb146101a75780639eb0fd4c146101d1578063a37dda2c146101db578063a54e4df514610205576100fd565b806301b49c7414610101578063272f946b1461012957806329dcb0cf146101535780637ab96b8f1461017d575b5f5ffd5b34801561010c575f5ffd5b5061012760048036038101906101229190611027565b610359565b005b348015610134575f5ffd5b5061013d6104de565b60405161014a919061106c565b60405180910390f35b34801561015e575f5ffd5b506101676104f1565b604051610174919061109d565b60405180910390f35b348015610188575f5ffd5b506101916104f7565b60405161019e919061109d565b60405180910390f35b3480156101b2575f5ffd5b506101bb6104fd565b6040516101c8919061109d565b60405180910390f35b6101d9610502565b005b3480156101e6575f5ffd5b506101ef610692565b6040516101fc91906110c5565b60405180910390f35b348015610210575f5ffd5b506102196106b7565b005b348015610226575f5ffd5b5061022f6107e9565b60405161023c91906110c5565b60405180910390f35b348015610250575f5ffd5b5061025961080e565b60405161026691906110c5565b60405180910390f35b34801561027a575f5ffd5b50610283610832565b005b348015610290575f5ffd5b50610299610ae5565b6040516102a6919061109d565b60405180910390f35b3480156102ba575f5ffd5b506102c3610aeb565b6040516102d09190611151565b60405180910390f35b3480156102e4575f5ffd5b506102ed610afd565b6040516102fa919061109d565b60405180910390f35b34801561030e575f5ffd5b50610317610b04565b604051610324919061109d565b60405180910390f35b348015610338575f5ffd5b50610341610b0a565b005b34801561034e575f5ffd5b50610357610c43565b005b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146103e7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103de906111c4565b60405180910390fd5b600360048111156103fb576103fa6110de565b5b60075f9054906101000a900460ff16600481111561041c5761041b6110de565b5b1415801561045c5750600480811115610438576104376110de565b5b60075f9054906101000a900460ff166004811115610459576104586110de565b5b14155b61049b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104929061122c565b60405180910390fd5b8060025f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600760019054906101000a900460ff1681565b60055481565b60065481565b600381565b60015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610591576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161058890611294565b60405180910390fd5b5f8060048111156105a5576105a46110de565b5b60075f9054906101000a900460ff1660048111156105c6576105c56110de565b5b14610606576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105fd906112fc565b60405180910390fd5b600454341461064a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161064190611364565b60405180910390fd5b6001600760016101000a81548160ff021916908315150217905550600160075f6101000a81548160ff0219169083600481111561068a576106896110de565b5b021790555050565b60015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60025f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610746576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161073d906113cc565b60405180910390fd5b600280600481111561075b5761075a6110de565b5b60075f9054906101000a900460ff16600481111561077c5761077b6110de565b5b146107bc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107b3906112fc565b60405180910390fd5b600160075f6101000a81548160ff021916908360048111156107e1576107e06110de565b5b021790555050565b60025f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146108c0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108b7906111c4565b60405180910390fd5b600160048111156108d4576108d36110de565b5b60075f9054906101000a900460ff1660048111156108f5576108f46110de565b5b148061093257505f600481111561090f5761090e6110de565b5b60075f9054906101000a900460ff1660048111156109305761092f6110de565b5b145b610971576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161096890611434565b60405180910390fd5b6203f480600554610982919061147f565b42116109c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109ba906114fc565b60405180910390fd5b600460075f6101000a81548160ff021916908360048111156109e8576109e76110de565b5b02179055505f6003549050600760019054906101000a900460ff1615610a195760045481610a16919061147f565b90505b5f5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1682604051610a5e90611547565b5f6040518083038185875af1925050503d805f8114610a98576040519150601f19603f3d011682016040523d82523d5f602084013e610a9d565b606091505b5050905080610ae1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ad8906115a5565b60405180910390fd5b5050565b60045481565b60075f9054906101000a900460ff1681565b6203f48081565b60035481565b60015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610b99576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b9090611294565b60405180910390fd5b6001806004811115610bae57610bad6110de565b5b60075f9054906101000a900460ff166004811115610bcf57610bce6110de565b5b14610c0f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c06906112fc565b60405180910390fd5b42600681905550600260075f6101000a81548160ff02191690836004811115610c3b57610c3a6110de565b5b021790555050565b60025f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610cd2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cc9906113cc565b60405180910390fd5b6002806004811115610ce757610ce66110de565b5b60075f9054906101000a900460ff166004811115610d0857610d076110de565b5b14610d48576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d3f906112fc565b60405180910390fd5b600360075f6101000a81548160ff02191690836004811115610d6d57610d6c6110de565b5b02179055505f60035490505f5f90506005546006541115610e0b575f600554600654610d9991906115c3565b90505f6201518082610dab9190611623565b90505f6201518083610dbd9190611653565b1115610dd2578080610dce90611683565b9150505b6003811115610de057600390505b6064816003610def91906116ca565b600354610dfc91906116ca565b610e069190611623565b925050505b80600354610e1991906115c3565b91505f60015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1660045484610e62919061147f565b604051610e6e90611547565b5f6040518083038185875af1925050503d805f8114610ea8576040519150601f19603f3d011682016040523d82523d5f602084013e610ead565b606091505b5050905080610ef1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ee890611755565b60405180910390fd5b5f821115610fc3575f5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1683604051610f3e90611547565b5f6040518083038185875af1925050503d805f8114610f78576040519150601f19603f3d011682016040523d82523d5f602084013e610f7d565b606091505b5050905080610fc1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fb8906117bd565b60405180910390fd5b505b50505050565b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610ff682610fcd565b9050919050565b61100681610fec565b8114611010575f5ffd5b50565b5f8135905061102181610ffd565b92915050565b5f6020828403121561103c5761103b610fc9565b5b5f61104984828501611013565b91505092915050565b5f8115159050919050565b61106681611052565b82525050565b5f60208201905061107f5f83018461105d565b92915050565b5f819050919050565b61109781611085565b82525050565b5f6020820190506110b05f83018461108e565b92915050565b6110bf81610fec565b82525050565b5f6020820190506110d85f8301846110b6565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602160045260245ffd5b6005811061111c5761111b6110de565b5b50565b5f81905061112c8261110b565b919050565b5f61113b8261111f565b9050919050565b61114b81611131565b82525050565b5f6020820190506111645f830184611142565b92915050565b5f82825260208201905092915050565b7f4e6f7420656d706c6f79657200000000000000000000000000000000000000005f82015250565b5f6111ae600c8361116a565b91506111b98261117a565b602082019050919050565b5f6020820190508181035f8301526111db816111a2565b9050919050565b7f436f6e747261637420616c72656164792066696e6973686564000000000000005f82015250565b5f61121660198361116a565b9150611221826111e2565b602082019050919050565b5f6020820190508181035f8301526112438161120a565b9050919050565b7f4e6f7420667265656c616e6365720000000000000000000000000000000000005f82015250565b5f61127e600e8361116a565b91506112898261124a565b602082019050919050565b5f6020820190508181035f8301526112ab81611272565b9050919050565b7f496e76616c6964207374617465000000000000000000000000000000000000005f82015250565b5f6112e6600d8361116a565b91506112f1826112b2565b602082019050919050565b5f6020820190508181035f830152611313816112da565b9050919050565b7f4d7573742073656e64206578616374203525207374616b6500000000000000005f82015250565b5f61134e60188361116a565b91506113598261131a565b602082019050919050565b5f6020820190508181035f83015261137b81611342565b9050919050565b7f4e6f74204149204167656e7400000000000000000000000000000000000000005f82015250565b5f6113b6600c8361116a565b91506113c182611382565b602082019050919050565b5f6020820190508181035f8301526113e3816113aa565b9050919050565b7f43616e6e6f7420726566756e64206e6f770000000000000000000000000000005f82015250565b5f61141e60118361116a565b9150611429826113ea565b602082019050919050565b5f6020820190508181035f83015261144b81611412565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61148982611085565b915061149483611085565b92508282019050808211156114ac576114ab611452565b5b92915050565b7f477261636520706572696f64206e6f74206f76657200000000000000000000005f82015250565b5f6114e660158361116a565b91506114f1826114b2565b602082019050919050565b5f6020820190508181035f830152611513816114da565b9050919050565b5f81905092915050565b50565b5f6115325f8361151a565b915061153d82611524565b5f82019050919050565b5f61155182611527565b9150819050919050565b7f526566756e64207472616e73666572206661696c6564000000000000000000005f82015250565b5f61158f60168361116a565b915061159a8261155b565b602082019050919050565b5f6020820190508181035f8301526115bc81611583565b9050919050565b5f6115cd82611085565b91506115d883611085565b92508282039050818111156115f0576115ef611452565b5b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f61162d82611085565b915061163883611085565b925082611648576116476115f6565b5b828204905092915050565b5f61165d82611085565b915061166883611085565b925082611678576116776115f6565b5b828206905092915050565b5f61168d82611085565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036116bf576116be611452565b5b600182019050919050565b5f6116d482611085565b91506116df83611085565b92508282026116ed81611085565b9150828204841483151761170457611703611452565b5b5092915050565b7f467265656c616e636572207472616e73666572206661696c65640000000000005f82015250565b5f61173f601a8361116a565b915061174a8261170b565b602082019050919050565b5f6020820190508181035f83015261176c81611733565b9050919050565b7f456d706c6f7965722070656e616c7479207472616e73666572206661696c65645f82015250565b5f6117a760208361116a565b91506117b282611773565b602082019050919050565b5f6020820190508181035f8301526117d48161179b565b905091905056fea26469706673582212208898e4d0b22becaa0f2b9af4c7a92b312d30be2acefb2ab33a205df6956c1cc664736f6c634300081f0033";
const AI_AGENT_WALLET = "0xbeE339Aa5d7af6758164F5739a2c98EB6f16a3AB";

interface Message { id: string; content: string; sender_address: string; receiver_address: string; created_at: string; }
interface ChatHistory { walletAddress: string; lastMessage: string; time: string; timestamp: number; }
interface Milestone { id: string; project_id: string; title: string; status: 'pending' | 'submitted' | 'approved' | 'rejected'; due_date: string; notes?: string; file_url?: string; created_at: string; }
interface ProjectFile { id: string; file_name: string; file_size: string; file_url?: string; }

export const ProjectChatView: React.FC = () => {
    const { walletAddress } = useWallet();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [activeChatWallet, setActiveChatWallet] = useState<string>('');
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [userRole, setUserRole] = useState<'employer' | 'freelancer' | 'viewer'>('viewer');
    const [hasFreelancerStaked, setHasFreelancerStaked] = useState(false);
    const [latestSubmission, setLatestSubmission] = useState<{description: string, fileUrl: string} | null>(null);

    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
    const [isSubmitMilestoneOpen, setIsSubmitMilestoneOpen] = useState(false);
    const [isReviewMilestoneOpen, setIsReviewMilestoneOpen] = useState(false);
    const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);

    const [msTitle, setMsTitle] = useState('');
    const [msDate, setMsDate] = useState('');
    const [msNotes, setMsNotes] = useState('');
    const [msFile, setMsFile] = useState<File | null>(null);
    const [isProcessingMilestone, setIsProcessingMilestone] = useState(false);

    const [workDescription, setWorkDescription] = useState('');
    const [workFile, setWorkFile] = useState<File | null>(null);
    const [isSubmittingEscrow, setIsSubmittingEscrow] = useState(false);
    const [isTriggeringAI, setIsTriggeringAI] = useState(false);

    const [fundingAmount, setFundingAmount] = useState('');
    const [durationDays, setDurationDays] = useState('7');
    const [aiAgentWallet, setAiAgentWallet] = useState(AI_AGENT_WALLET);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedContractAddress, setDeployedContractAddress] = useState<string | null>(null);
    const [isStaking, setIsStaking] = useState(false);

    const [isAddingChat, setIsAddingChat] = useState(false);
    const [newWalletInput, setNewWalletInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const formatAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

    const getRoomId = () => {
        if (!walletAddress || !activeChatWallet) return '';
        return [walletAddress.toLowerCase(), activeChatWallet.toLowerCase()].sort().join('_');
    };

    useEffect(() => {
        const identifyRole = async () => {
            if (!window.ethereum || !deployedContractAddress || !walletAddress) return;
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, provider);

                const [employerAddr, freelancerAddr, isFunded] = await Promise.all([
                    contract.employer(),
                    contract.freelancer(),
                    contract.freelancerFunded()
                ]);

                if (walletAddress.toLowerCase() === employerAddr.toLowerCase()) setUserRole('employer');
                else if (walletAddress.toLowerCase() === freelancerAddr.toLowerCase()) setUserRole('freelancer');
                else setUserRole('viewer');

                setHasFreelancerStaked(isFunded);
            } catch (e) {
                console.error(e);
            }
        };
        identifyRole();
    }, [deployedContractAddress, walletAddress]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) setFilePreview(URL.createObjectURL(file));
            else setFilePreview('file');
        }
    };

    const handleWorkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setWorkFile(file);
    };

    const clearFileSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
    };

    const handleCreateMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!msTitle || !msDate) return;
        setIsProcessingMilestone(true);
        try {
            const { data, error } = await supabase.from('project_milestones').insert([{
                project_id: getRoomId(),
                title: msTitle,
                due_date: msDate,
                status: 'pending'
            }]).select();

            if (error) throw error;

            if (data) {
                setMilestones(prev => [...prev, data[0]]);
            }

            await supabase.from('messages').insert([{
                content: `New Milestone Added: **${msTitle}** (Due: ${msDate})`,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);

            setIsAddMilestoneOpen(false);
            setMsTitle('');
            setMsDate('');
        } catch (error: any) {
            console.error(error);
            alert(`Failed to create milestone: ${error.message}`);
        } finally { setIsProcessingMilestone(false); }
    };

    const handleMilestoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeMilestone || !msNotes) return;
        setIsProcessingMilestone(true);
        try {
            let publicUrl = null;
            if (msFile) {
                const filePath = `${getRoomId()}/milestones/${Date.now()}_${msFile.name}`;
                const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, msFile);
                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('project-files').getPublicUrl(filePath);
                publicUrl = data.publicUrl;

                await supabase.from('project_files').insert([{ project_id: getRoomId(), file_name: msFile.name, file_size: `${(msFile.size / (1024 * 1024)).toFixed(2)} MB`, file_url: publicUrl }]);
            }

            const { error: updateError } = await supabase.from('project_milestones').update({
                status: 'submitted',
                notes: msNotes,
                file_url: publicUrl
            }).eq('id', activeMilestone.id);

            if (updateError) throw updateError;

            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status: 'submitted', notes: msNotes, file_url: publicUrl || m.file_url } : m));

            await supabase.from('messages').insert([{
                content: `Milestone Update Submitted: **${activeMilestone.title}**\nNotes: ${msNotes}${publicUrl ? `\nFileURL: ${publicUrl}` : ''}`,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);

            setIsSubmitMilestoneOpen(false);
            setMsNotes('');
            setMsFile(null);
            alert("Milestone updated successfully!");
        } catch (error: any) {
            console.error(error);
            alert(`Update failed: ${error.message}. Please check Supabase permissions.`);
        } finally { setIsProcessingMilestone(false); }
    };

    const handleMilestoneReview = async (status: 'approved' | 'rejected') => {
        if (!activeMilestone) return;
        setIsProcessingMilestone(true);
        try {
            const { error: updateError } = await supabase.from('project_milestones').update({ status }).eq('id', activeMilestone.id);
            if (updateError) throw updateError;

            setMilestones(prev => prev.map(m => m.id === activeMilestone.id ? { ...m, status } : m));

            await supabase.from('messages').insert([{
                content: status === 'approved'
                    ? `Milestone Approved: **${activeMilestone.title}**`
                    : `Milestone Rejected: **${activeMilestone.title}**\nPlease revise and update.`,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);
            setIsReviewMilestoneOpen(false);
        } catch (error: any) {
            console.error(error);
            alert(`Review failed: ${error.message}`);
        } finally { setIsProcessingMilestone(false); }
    };

    const handleDeployEscrow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.ethereum || !fundingAmount || !durationDays || !activeChatWallet || !aiAgentWallet) return;

        try {
            setIsDeploying(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const value = ethers.parseEther(fundingAmount);
            const factory = new ethers.ContractFactory(ESCROW_ABI, ESCROW_BYTECODE, signer);

            const contract = await factory.deploy(activeChatWallet, aiAgentWallet, parseInt(durationDays), { value, gasLimit: 3000000 });
            await contract.waitForDeployment();
            const address = await contract.getAddress();

            setDeployedContractAddress(address);
            setIsFundModalOpen(false);

            await supabase.from('messages').insert([{
                content: `Escrow Funded! Contract Address: ${address}`,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeploying(false);
        }
    };

    const handleFreelancerStake = async () => {
        if (!window.ethereum || !deployedContractAddress || userRole !== 'freelancer') {
            alert("Only the assigned Freelancer can stake.");
            return;
        }
        try {
            setIsStaking(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(deployedContractAddress, ESCROW_ABI, signer);
            const stakeAmount = await contract.freelancerStake();
            const tx = await contract.stakeFreelancer({ value: stakeAmount, gasLimit: 500000 });
            await tx.wait();
            setHasFreelancerStaked(true);
            alert("Stake successful! You can now submit work.");
        } catch (error) {
            console.error(error);
            alert("Stake failed. Ensure you are on the Freelancer account with enough balance.");
        } finally {
            setIsStaking(false);
        }
    };

    const submitWorkToDatabase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workDescription.trim() || !workFile) return;

        try {
            setIsSubmittingEscrow(true);
            const roomId = getRoomId();
            const filePath = `${roomId}/submissions/${Date.now()}_${workFile.name}`;

            const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, workFile);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);

            const submissionMessage = `WORK SUBMITTED\nDescription: ${workDescription}\nFileURL: ${publicUrl}`;

            await supabase.from('messages').insert([{
                content: submissionMessage,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);

            if (activeChatWallet.toLowerCase() !== AI_AGENT_WALLET.toLowerCase()) {
                await supabase.from('messages').insert([{
                    content: submissionMessage,
                    sender_address: walletAddress,
                    receiver_address: AI_AGENT_WALLET
                }]);
            }

            alert("Final Work submitted securely! The employer can now review it and trigger the AI Agent.");
            setIsSubmitModalOpen(false);
            setWorkFile(null);
            setWorkDescription('');
        } catch (error: any) {
            console.error(error);
            alert("Submission failed. Ensure you have network connectivity.");
        } finally {
            setIsSubmittingEscrow(false);
        }
    };

    const handleTriggerAIReview = async () => {
        if (!latestSubmission || !deployedContractAddress) return;
        setIsTriggeringAI(true);
        try {
            await supabase.from('messages').insert([{
                content: `TRIGGER_AI_REVIEW\nContract: ${deployedContractAddress}\nFileURL: ${latestSubmission.fileUrl}`,
                sender_address: walletAddress,
                receiver_address: AI_AGENT_WALLET
            }]);

            await supabase.from('messages').insert([{
                content: `AI Agent has been triggered to review the submission...`,
                sender_address: walletAddress,
                receiver_address: activeChatWallet
            }]);

            alert("AI Agent has been notified! It will now review the file and release the funds if approved.");
            setIsReviewModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Failed to trigger AI.");
        } finally {
            setIsTriggeringAI(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !walletAddress || !activeChatWallet) return;
        const roomId = getRoomId();
        const content = newMessage.trim() || `Sent a file: ${selectedFile?.name}`;
        try {
            if (selectedFile) {
                setIsUploading(true);
                const filePath = `${roomId}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
                await supabase.storage.from('project-files').upload(filePath, selectedFile);
                const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
                await supabase.from('project_files').insert([{ project_id: roomId, file_name: selectedFile.name, file_size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`, file_url: publicUrl }]);

                await supabase.from('messages').insert([{ content: `${content}\n${publicUrl}`, sender_address: walletAddress, receiver_address: activeChatWallet }]);
            } else {
                await supabase.from('messages').insert([{ content, sender_address: walletAddress, receiver_address: activeChatWallet }]);
            }

            setNewMessage('');
            clearFileSelection();
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (!walletAddress) return;
        const fetchHistory = async () => {
            const { data } = await supabase.from('messages').select('*').or(`sender_address.eq.${walletAddress},receiver_address.eq.${walletAddress}`).order('created_at', { ascending: false });
            if (data) {
                const historyMap = new Map<string, ChatHistory>();
                historyMap.set(AI_AGENT_WALLET, { walletAddress: AI_AGENT_WALLET, lastMessage: 'System Ready', time: '', timestamp: Date.now() });

                data.forEach((msg: Message) => {
                    const other = msg.sender_address === walletAddress ? msg.receiver_address : msg.sender_address;
                    if (!historyMap.has(other)) {
                        historyMap.set(other, { walletAddress: other, lastMessage: msg.content, time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: new Date(msg.created_at).getTime() });
                    }
                });
                const arr = Array.from(historyMap.values()).sort((a, b) => b.timestamp - a.timestamp);
                setChatHistory(arr);
                if (arr.length > 0 && !activeChatWallet) setActiveChatWallet(arr[0].walletAddress);
            }
        };
        fetchHistory();
    }, [walletAddress]);

    useEffect(() => {
        if (!walletAddress || !activeChatWallet) return;
        const roomId = getRoomId();
        const fetchData = async () => {
            setIsLoading(true);
            const [msgRes, filRes, milRes] = await Promise.all([
                supabase.from('messages').select('*').or(`and(sender_address.eq.${walletAddress},receiver_address.eq.${activeChatWallet}),and(sender_address.eq.${activeChatWallet},receiver_address.eq.${walletAddress})`).order('created_at', { ascending: true }),
                supabase.from('project_files').select('*').eq('project_id', roomId),
                supabase.from('project_milestones').select('*').eq('project_id', roomId).order('due_date', { ascending: true })
            ]);
            if (msgRes.data) {
                setMessages(msgRes.data);

                const submissionMsgs = msgRes.data.filter((m: any) => m.content.includes("WORK SUBMITTED") || m.content.includes("Submitted:"));
                if (submissionMsgs.length > 0) {
                    const lastSub = submissionMsgs[submissionMsgs.length - 1].content;
                    const descMatch = lastSub.match(/(?:Description:|Submitted:)\s*(.*?)(?=\n|FileURL:|$)/is);
                    const urlMatch = lastSub.match(/(?:FileURL:|File\s*URL:)\s*(https?:\/\/[^\s]+)/i);
                    setLatestSubmission({
                        description: descMatch ? descMatch[1].trim() : 'Work Submission',
                        fileUrl: urlMatch ? urlMatch[1] : ''
                    });
                } else {
                    setLatestSubmission(null);
                }

                const contractMsg = msgRes.data.find(m => m.content.includes("Contract Address: 0x"));
                if (contractMsg) {
                    const match = contractMsg.content.match(/0x[a-fA-F0-9]{40}/);
                    if (match) setDeployedContractAddress(match[0]);
                }
            }
            if (filRes.data) setFiles(filRes.data);
            if (milRes.data) setMilestones(milRes.data);
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        };
        fetchData();

        const channelMsg = supabase.channel(`room_msg:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
        const channelMil = supabase.channel(`room_mil:${roomId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'project_milestones' }, fetchData).subscribe();

        return () => {
            supabase.removeChannel(channelMsg);
            supabase.removeChannel(channelMil);
        };
    }, [walletAddress, activeChatWallet]);

    const renderMessageContent = (content: string) => {
        if (content.includes("WORK SUBMITTED") || content.includes("Milestone Update Submitted:") || content.includes("Submitted:")) {
            const cleanText = content.split(/File\s*URL:?/i)[0].trim();
            let finalText = cleanText;

            if (finalText.includes("WORK SUBMITTED")) {
                const descMatch = finalText.match(/Description:\s*(.*)/s);
                finalText = descMatch ? `Submitted: ${descMatch[1].trim()}` : 'Submitted: Final Documentation';
            }
            return <span className="font-medium text-sm block truncate whitespace-normal">{finalText}</span>;
        }

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="mt-3 w-full bg-black/10 hover:bg-black/20 border border-black/10 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-black transition-all break-all text-center">
                        <FileText size={16} className="flex-shrink-0" /> <span className="truncate">View Attached File</span>
                    </a>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    const progress = milestones.length > 0
        ? Math.round((milestones.filter(m => m.status === 'approved').length / milestones.length) * 100)
        : (latestSubmission ? 50 : 0);

    return (
        <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden border-t border-zinc-100 relative">

            {isFundModalOpen && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Fund Escrow</h3><button onClick={() => setIsFundModalOpen(false)}><X size={20} /></button></div>
                        <form onSubmit={handleDeployEscrow} className="space-y-4">
                            <input type="number" step="0.001" value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} placeholder="Amount (DEV)" className="w-full p-3 border rounded-xl" required />
                            <input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="Days" className="w-full p-3 border rounded-xl" required />
                            <input type="text" value={aiAgentWallet} onChange={(e) => setAiAgentWallet(e.target.value)} placeholder="AI Agent Wallet Address" className="w-full p-3 border rounded-xl font-mono text-sm" required />
                            <button type="submit" disabled={isDeploying} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase">{isDeploying ? <Loader2 className="animate-spin mx-auto" /> : "Deploy & Fund"}</button>
                        </form>
                    </div>
                </div>
            )}

            {isSubmitModalOpen && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Final Work Submission</h3><button onClick={() => setIsSubmitModalOpen(false)}><X size={20} /></button></div>
                        <form onSubmit={submitWorkToDatabase} className="space-y-4">
                            <textarea value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} placeholder="Describe your final work..." className="w-full h-24 p-4 bg-zinc-50 border rounded-xl resize-none outline-none focus:border-brand-500" required />
                            <div className="p-4 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center gap-2">
                                <UploadCloud className="text-zinc-400" />
                                <input type="file" onChange={handleWorkFileChange} className="text-xs" required />
                                {workFile && <p className="text-[10px] text-brand-600 font-bold mt-2 truncate w-full text-center">{workFile.name}</p>}
                            </div>
                            <button type="submit" disabled={isSubmittingEscrow} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase">{isSubmittingEscrow ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Final Submission"}</button>
                        </form>
                    </div>
                </div>
            )}

            {isReviewModalOpen && latestSubmission && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-zinc-900">Review Final Submission</h3>
                            <button onClick={() => setIsReviewModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Freelancer Notes</p>
                                <div className="p-4 bg-zinc-50 rounded-xl text-sm text-zinc-800 border border-zinc-100 whitespace-pre-wrap break-words">
                                    {latestSubmission.description}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <a href={latestSubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-zinc-100 text-zinc-900 rounded-xl font-black uppercase shadow-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                                    <FileText size={18} /> Open Attached File
                                </a>
                                <button
                                    onClick={handleTriggerAIReview}
                                    disabled={isTriggeringAI}
                                    className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {isTriggeringAI ? <Loader2 className="animate-spin" /> : <Bot size={18} />}
                                    Approve & Release via AI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAddMilestoneOpen && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Add Milestone</h3><button onClick={() => setIsAddMilestoneOpen(false)}><X size={20} /></button></div>
                        <form onSubmit={handleCreateMilestone} className="space-y-4">
                            <input type="text" value={msTitle} onChange={e => setMsTitle(e.target.value)} placeholder="Milestone Title (e.g., UI Wireframes)" className="w-full p-3 border rounded-xl" required />
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">Due Date</label>
                                <input type="date" value={msDate} onChange={e => setMsDate(e.target.value)} className="w-full p-3 border rounded-xl text-sm" required />
                            </div>
                            <button type="submit" disabled={isProcessingMilestone} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-black uppercase">{isProcessingMilestone ? <Loader2 className="animate-spin mx-auto" /> : "Create Milestone"}</button>
                        </form>
                    </div>
                </div>
            )}

            {isSubmitMilestoneOpen && activeMilestone && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Submit Update</h3><button onClick={() => setIsSubmitMilestoneOpen(false)}><X size={20} /></button></div>
                        <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                            <p className="text-sm font-bold text-zinc-600 mb-2">Milestone: {activeMilestone.title}</p>
                            <textarea value={msNotes} onChange={e => setMsNotes(e.target.value)} placeholder="What did you complete?" className="w-full h-24 p-4 bg-zinc-50 border rounded-xl resize-none outline-none focus:border-brand-500" required />
                            <div className="p-4 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center gap-2">
                                <UploadCloud className="text-zinc-400" />
                                <input type="file" onChange={e => setMsFile(e.target.files?.[0] || null)} className="text-xs" />
                                {msFile && <p className="text-[10px] text-brand-600 font-bold mt-2 truncate w-full text-center">{msFile.name}</p>}
                            </div>
                            <button type="submit" disabled={isProcessingMilestone} className="w-full py-4 bg-brand-600 text-white rounded-xl font-black uppercase">{isProcessingMilestone ? <Loader2 className="animate-spin mx-auto" /> : "Send Update"}</button>
                        </form>
                    </div>
                </div>
            )}

            {isReviewMilestoneOpen && activeMilestone && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Review Milestone</h3><button onClick={() => setIsReviewMilestoneOpen(false)}><X size={20} /></button></div>
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-zinc-900">{activeMilestone.title}</p>
                            <div className="p-4 bg-zinc-50 rounded-xl text-sm border border-zinc-100 whitespace-pre-wrap">
                                {activeMilestone.notes}
                            </div>
                            {activeMilestone.file_url && (
                                <a href={activeMilestone.file_url} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-zinc-100 text-zinc-900 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all">
                                    <FileText size={16} /> Open Attached File
                                </a>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => handleMilestoneReview('rejected')} disabled={isProcessingMilestone} className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-black uppercase text-xs hover:bg-red-50 transition-all">Reject</button>
                                <button onClick={() => handleMilestoneReview('approved')} disabled={isProcessingMilestone} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs hover:bg-emerald-600 transition-all">Approve</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden lg:flex flex-col w-72 border-r bg-zinc-50/30">
                <div className="p-4 border-b bg-white flex justify-between items-center"><span className="font-black text-zinc-900 text-sm">Inbox</span><button onClick={() => setIsAddingChat(!isAddingChat)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-brand-600"><Plus size={18} /></button></div>
                {isAddingChat && <div className="p-4 border-b bg-white shadow-inner"><form onSubmit={(e) => {
                    e.preventDefault();
                    if (newWalletInput.startsWith('0x')) {
                        setActiveChatWallet(newWalletInput);
                        if (!chatHistory.find(c => c.walletAddress.toLowerCase() === newWalletInput.toLowerCase())) {
                            setChatHistory(prev => [{ walletAddress: newWalletInput, lastMessage: 'New Chat Started', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now() }, ...prev]);
                        }
                        setNewWalletInput('');
                        setIsAddingChat(false);
                    }
                }} className="space-y-2"><input type="text" value={newWalletInput} onChange={(e) => setNewWalletInput(e.target.value)} placeholder="0x..." className="w-full p-2 border rounded font-mono text-xs" /><button type="submit" className="w-full py-2 bg-black text-white text-[10px] font-black uppercase rounded">Start</button></form></div>}
                <div className="flex-1 overflow-y-auto">
                    {chatHistory.map(chat => (
                        <button key={chat.walletAddress} onClick={() => setActiveChatWallet(chat.walletAddress)} className={`w-full p-4 text-left border-b flex items-center gap-3 ${activeChatWallet === chat.walletAddress ? 'bg-white border-l-4 border-l-brand-500 shadow-sm' : 'hover:bg-zinc-100/50'}`}>
                            {chat.walletAddress === AI_AGENT_WALLET ? <Bot className="text-brand-600 flex-shrink-0" size={24} /> : <UserCircle className="text-zinc-400 flex-shrink-0" size={24} />}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-mono font-bold text-zinc-900 truncate">
                                    {chat.walletAddress === AI_AGENT_WALLET ? 'AI Agent' : formatAddress(chat.walletAddress)}
                                </p>
                                <p className="text-[10px] text-zinc-400 truncate mt-1">
                                    {(chat.lastMessage.includes('WORK SUBMITTED') || chat.lastMessage.includes('Submitted:'))
                                        ? `Submitted: ${chat.lastMessage.match(/(?:Description:|Submitted:)\s*(.*?)(?=\n|File\s*URL:|$)/is)?.[1] || 'work'}`
                                        : chat.lastMessage}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white min-w-0 relative">
                <div className="p-4 border-b font-mono font-bold flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <span className="text-zinc-900 flex items-center gap-2">
                        {activeChatWallet === AI_AGENT_WALLET ? <><Bot size={18} className="text-brand-600"/> AI Agent</> : formatAddress(activeChatWallet) || 'Select a chat'}
                    </span>
                    {userRole !== 'viewer' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full">
                            <UserCircle size={14} className="text-zinc-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{userRole}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/20">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender_address === walletAddress ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-4 rounded-3xl max-w-[80%] overflow-hidden ${msg.sender_address === walletAddress ? 'bg-brand-600 text-white rounded-tr-sm shadow-lg' : 'bg-white border text-zinc-800 rounded-tl-sm shadow-sm'}`}>
                                <div className="text-sm whitespace-pre-wrap break-words break-all leading-relaxed">
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {filePreview && (
                    <div className="px-6 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-4">
                        <div className="relative w-12 h-12 bg-white border border-zinc-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {filePreview === 'file' ? <FileText size={20} className="text-zinc-400" /> : <img src={filePreview} alt="preview" className="object-cover w-full h-full" />}
                            <button onClick={clearFileSelection} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"><X size={10} /></button>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 truncate flex-1">{selectedFile?.name}</p>
                    </div>
                )}
                <div className="p-4 bg-white border-t border-zinc-100">
                    <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto items-end">
                        <label className="p-3 bg-zinc-100 rounded-full cursor-pointer hover:bg-zinc-200 transition-all flex-shrink-0"><Paperclip size={18} /><input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || !activeChatWallet} /></label>
                        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl resize-none outline-none focus:bg-white focus:border-brand-500 transition-all shadow-inner" rows={1} />
                        <button type="submit" disabled={isUploading} className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 shadow-lg transition-all flex-shrink-0">{isUploading ? <Loader2 className="animate-spin" /> : <Send size={18} />}</button>
                    </form>
                </div>
            </div>

            <div className="hidden xl:flex flex-col w-96 border-l bg-white p-6 space-y-8 overflow-y-auto">
                <h2 className="text-xl font-black text-zinc-900">Project Hub</h2>

                <div className="bg-white border border-zinc-100 rounded-[2rem] p-6 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-sm font-black text-zinc-900">Progress</h3>
                        <span className="text-lg font-black text-brand-600">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-zinc-100 rounded-full my-2 overflow-hidden"><div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} /></div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2"><Calendar size={16} className="text-brand-600"/> Milestones</h3>
                        {userRole === 'employer' && (
                            <button onClick={() => setIsAddMilestoneOpen(true)} className="p-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-700 transition-all"><Plus size={16} /></button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {milestones.length === 0 && <p className="text-[10px] text-zinc-400 text-center py-4 border-2 border-dashed border-zinc-100 rounded-2xl">No milestones set</p>}
                        {milestones.map(m => (
                            <div key={m.id} className={`p-4 border rounded-2xl transition-all ${m.status === 'approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-zinc-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-black text-zinc-900 leading-tight">{m.title}</p>
                                    {m.status === 'pending' && <span className="text-[9px] font-bold px-2 py-1 bg-zinc-100 text-zinc-500 rounded-full flex items-center gap-1"><Clock size={10}/> Pending</span>}
                                    {m.status === 'submitted' && <span className="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Review</span>}
                                    {m.status === 'approved' && <span className="text-[9px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>}
                                    {m.status === 'rejected' && <span className="text-[9px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-full flex items-center gap-1"><AlertCircle size={10}/> Revise</span>}
                                </div>
                                <p className="text-[10px] text-zinc-500 mb-3">Due: {new Date(m.due_date).toLocaleDateString()}</p>

                                {userRole === 'freelancer' && (m.status === 'pending' || m.status === 'rejected') && (
                                    <button onClick={() => { setActiveMilestone(m); setIsSubmitMilestoneOpen(true); }} className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-zinc-800 transition-all">Submit Update</button>
                                )}
                                {userRole === 'employer' && m.status === 'submitted' && (
                                    <button onClick={() => { setActiveMilestone(m); setIsReviewMilestoneOpen(true); }} className="w-full py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-700 transition-all shadow-md">Review Update</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-50 border border-brand-100 rounded-[2rem] p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4"><ShieldCheck className="text-brand-600" size={20} /><h3 className="text-sm font-black text-brand-900">Smart Escrow</h3></div>
                    {!deployedContractAddress ? (
                        <button onClick={() => setIsFundModalOpen(true)} className="w-full py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase shadow-lg active:scale-95 transition-all"><Coins size={16} className="inline mr-2" /> Fund Escrow</button>
                    ) : (
                        <div className="space-y-2">
                            {userRole === 'freelancer' && (
                                <>
                                    {!hasFreelancerStaked ? (
                                        <button onClick={handleFreelancerStake} disabled={isStaking} className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-amber-600 transition-all">
                                            {isStaking ? <Loader2 className="animate-spin mx-auto" /> : "1. Stake 5% to Start"}
                                        </button>
                                    ) : (
                                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 flex items-center gap-2 mb-2">
                                            <CheckCircle2 size={16} />
                                            <span className="text-[10px] font-black uppercase">Funds Staked</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setIsSubmitModalOpen(true)}
                                        disabled={isSubmittingEscrow || !hasFreelancerStaked}
                                        className="w-full py-3 bg-brand-600 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50"
                                    >
                                        {latestSubmission ? "Resubmit Final Work" : "Submit Final Work"}
                                    </button>
                                </>
                            )}

                            {userRole === 'employer' && (
                                latestSubmission ? (
                                    <button onClick={() => setIsReviewModalOpen(true)} className="w-full py-3 bg-brand-600 text-white rounded-xl text-xs font-black uppercase shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
                                        <Search size={16} /> Review Final Delivery
                                    </button>
                                ) : (
                                    <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                        {!hasFreelancerStaked ? "Waiting for Freelancer Stake..." : "Waiting for Final Submission"}
                                    </p>
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-900">Shared Files 📁</h3>
                    <div className="grid gap-3">
                        {files.map(f => (<a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-all group shadow-sm"><FileText size={18} className="text-zinc-400 group-hover:text-brand-600 flex-shrink-0" /><div className="min-w-0 flex-1"><p className="text-[11px] font-black text-zinc-800 truncate">{f.file_name}</p><p className="text-[9px] font-bold text-zinc-400">{f.file_size}</p></div></a>))}
                    </div>
                </div>
            </div>
        </div>
    );
};