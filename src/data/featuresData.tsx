import React from 'react';
import { Network, Shield, Brain, TrendingUp, AlertTriangle, Search } from 'lucide-react';

export const features = [
  {
    icon: <Network className="h-6 w-6" />,
    title: "Graph Neural Network",
    description: "Advanced GNN algorithms detect complex money laundering topologies and layering patterns in blockchain transaction graphs."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "AML Compliance",
    description: "Meet Anti-Money Laundering regulations with automated detection and comprehensive reporting for regulatory bodies."
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Pattern Recognition",
    description: "Identify Fan-Out/Fan-In structures, Gather-Scatter patterns, and Peeling Chains used in Smurfing operations."
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Topology Mining",
    description: "Discover suspicious wallet clusters and trace illicit fund flows through multiple intermediate wallets."
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Suspicion Scoring",
    description: "Calculate risk scores for every wallet based on centrality measures and connections to known illicit nodes."
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Real-time Alerts",
    description: "Get instant notifications when suspicious patterns are detected, enabling rapid investigation and response."
  }
];


