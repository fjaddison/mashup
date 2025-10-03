import React, { useState } from 'react';

// contract addresses for Nouns Descriptor V3, Nouns SVG Renderer, and Tiny Dinos onchain
const NOUNS_DESCRIPTOR_V3_ADDRESS = '0x33A9c445fb4FB21f2c030A6b2d3e2F12D017BFAC';
const SVG_RENDERER_ADDRESS = '0x535BD6533f165B880066A9B61e9C5001465F398C';
const DINOS_ADDRESS = '0x2C9605aa2Cf6Ff2683Fc1902799d8411ca91Da1e';

const TEMP_HEAD_INDEX = Math.floor(Math.random() * 60)
const TEMP_GLASSES_INDEX = Math.floor(Math.random() * 13)

// Simplified ABI with just the functions we need
const NOUNS_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "heads",
    "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "bodies",
    "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "glasses",
    "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "headCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "glassesCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint8", "name": "index", "type": "uint8"}],
    "name": "palettes",
    "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// SVGRenderer ABI
const SVG_RENDERER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {"internalType": "bytes", "name": "image", "type": "bytes"},
          {"internalType": "bytes", "name": "palette", "type": "bytes"}
        ],
        "internalType": "struct ISVGRenderer.Part",
        "name": "part",
        "type": "tuple"
      }
    ],
    "name": "generateSVGPart",
    "outputs": [{"internalType": "string", "name": "partialSVG", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {"internalType": "bytes", "name": "image", "type": "bytes"},
              {"internalType": "bytes", "name": "palette", "type": "bytes"}
            ],
            "internalType": "struct ISVGRenderer.Part[]",
            "name": "parts",
            "type": "tuple[]"
          },
          {"internalType": "string", "name": "background", "type": "string"}
        ],
        "internalType": "struct ISVGRenderer.SVGParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "generateSVG",
    "outputs": [{"internalType": "string", "name": "svg", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  }
];

const DINOS_ABI = [
    {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "tokenUri", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const Builder = () => {
    const [error, setError] = useState(null);
    const [svgData, setSvgData] = useState(null);
    const [headsData, setHeadsData] = useState(null);
    const [ethersLoaded, setEthersLoaded] = useState(false)
    
    // Initialize ethers
    const getProvider = () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            return new window.ethers.BrowserProvider(window.ethereum);
        } else if (typeof window !== 'undefined' && window.ethers) {
            return new window.ethers.JsonRpcProvider(process.env.local);
        }
        throw new Error('Ethers not loaded or not in browser environment');
    };

    const getContract = async () => {
        const provider = getProvider();
        return new window.ethers.Contract(NOUNS_DESCRIPTOR_V3_ADDRESS, NOUNS_ABI, provider);
    };

    const getDinos = async () => {
        const provider = getProvider();
        return new window.ethers.Contract(DINOS_ADDRESS, DINOS_ABI, provider);
    };

    const getSVGRenderer = async () => {
        const provider = getProvider();
        return new window.ethers.Contract(SVG_RENDERER_ADDRESS, SVG_RENDERER_ABI, provider);
    };

    const callHeadsFunction = async () => {
        // setLoading(true);
        setError(null);

        try {
            const contract = await getContract();
            const svgRenderer = await getSVGRenderer();
            // need separate callToadz built into the component
            // const toadzContract = await getToadz();

            const dinosContract = await getDinos();
            
            // Get head data and palette
            const headsBytes = await contract.heads(TEMP_HEAD_INDEX);
            console.log(headsBytes)
            const paletteBytes = await contract.palettes(0); // Use palette 0 for now

            const dino = await dinosContract.tokenURI(49)
            const base64JSONdino = dino.split(',')[1]
            const dinoMetadata = JSON.parse(Buffer.from(base64JSONdino, 'base64').toString())

            console.log('dino image: ', dinoMetadata.image)
            console.log('dino: ', dino)

            const base64SVG = dinoMetadata.image.replace('data:image/svg+xml;base64,', '');

            const svgMarkup = atob(base64SVG);
            console.log('base64SVG:', base64SVG)
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
            doc.querySelector('svg').style = 'background-color: ;'
            console.log(doc)
            
            console.log('Raw heads data:', headsBytes);
            console.log('Palette data:', paletteBytes);
            // console.log('Using glasses index:', glassesIndex);
            
            // Get glasses data
           
            const glassesBytes = await contract.glasses(TEMP_GLASSES_INDEX);
            console.log('Raw glasses data:', glassesBytes);

            // Get bodies data
            let bodiesBytes = null;
            bodiesBytes = await contract.bodies(2);
            console.log('Raw bodies data:', bodiesBytes);
            
            // Use official SVGRenderer to generate combined SVG
            let officialSVG = null;
            try {
                const parts = [{
                    image: bodiesBytes,
                    palette: paletteBytes
                }, 
                {
                    image: headsBytes,
                    palette: paletteBytes
                }];
            
                // Add glasses if we have them
                parts.push({
                image: glassesBytes,
                palette: paletteBytes
                });
                
                const svgParams = {
                    parts: parts,
                    background: 'd5d7e1' // Light grey background
                };
            
                officialSVG = await svgRenderer.generateSVG(svgParams);
                console.log('SVG:', officialSVG);
                console.log('Official combined SVG generated:', officialSVG.substring(0, 200));
            } catch (svgError) {
                console.error('SVGRenderer error:', svgError);
            }
            
            // Convert bytes to hex string for display
            let displayInfo = null;
            if (headsBytes && headsBytes !== '0x') {
                const hexString = headsBytes.startsWith('0x') ? headsBytes : '0x' + headsBytes;
                const bytesArray = [];
                
                for (let i = 2; i < hexString.length; i += 2) {
                    bytesArray.push('0x' + hexString.substr(i, 2));
                }
                
                displayInfo = {
                    length: (hexString.length - 2) / 2,
                    bytes: bytesArray,
                    hexString: hexString
                };
            }
            
            setSvgData({
                officialSVG: officialSVG
            });
            
        } catch (err) {
            console.error('Heads function error:', err);
            setError(err.message || 'Failed to get heads data');
        } 
    };

    // Load ethers library
    React.useEffect(() => {
        const loadEthers = async () => {
            if (typeof window !== 'undefined' && !window.ethers) {
                try {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.1/ethers.umd.min.js';
                script.onload = () => {
                    console.log('Ethers loaded successfully');
                    setEthersLoaded(true);
                };
                script.onerror = () => {
                    setError('Failed to load ethers.js library');
                };
                document.head.appendChild(script);
                } catch (err) {
                    setError('Failed to load ethers.js');
                }
            } else if (typeof window !== 'undefined' && window.ethers) {
                setEthersLoaded(true);
            }
        };
        loadEthers();
    }, []);

    return (
        <>
            <button
                onClick={callHeadsFunction}
                disabled={!ethersLoaded}
            >
                Get Head
            </button>
            <br/>
            {svgData && (
                <div dangerouslySetInnerHTML={{
                    __html: svgData.officialSVG
                }}>
                </div>
            )}
        </>
    )
}

export default Builder;