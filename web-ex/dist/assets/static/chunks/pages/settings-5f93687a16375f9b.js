(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[662],{38356:function(e,s,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/settings",function(){return t(99687)}])},99687:function(e,s,t){"use strict";t.r(s),t.d(s,{default:function(){return h}});var a=t(85893),r=t(67294),l=t(11163),c=t(90845),n=t(19314),i=t(62940),d=t(23023),o=t(3306),x=t(36165),m=t(98312);function h(){let e=(0,l.useRouter)(),[s,t]=(0,r.useState)(null),[h,u]=(0,r.useState)({seedPhrase:!1,privateKey:!1}),[b,y]=(0,r.useState)(null),[j,N]=(0,r.useState)({seedPhrase:!1,privateKey:!1,publicKey:!1,accountId:!1});(0,r.useEffect)(()=>{let s=async()=>{let s=await m.t.get("publicWalletInfo"),a=await m.t.get("encryptedWallet");if(!s||!a){e.push("/");return}try{let e=await m.e.decrypt(a);t({...s,...e})}catch(e){y("Error decrypting wallet data"),console.error("Decryption error:",e)}};s()},[e]);let g=async(e,s)=>{try{await navigator.clipboard.writeText(e),N(e=>({...e,[s]:!0})),setTimeout(()=>{N(e=>({...e,[s]:!1}))},2e3)}catch(e){console.error("Failed to copy:",e)}},p=async()=>{await m.t.clear(),e.push("/")},v=e=>{u(s=>({...s,[e]:!s[e]}))};return s?(0,a.jsx)("div",{className:"min-h-[600px] p-4 bg-gray-50",children:(0,a.jsx)(c.w,{className:"max-w-md mx-auto",children:(0,a.jsxs)(n.G,{className:"p-6",children:[(0,a.jsx)("h1",{className:"text-2xl font-bold mb-4",children:"Settings"}),(0,a.jsxs)("div",{className:"space-y-6",children:[(0,a.jsxs)("div",{className:"bg-yellow-50 p-6 rounded-lg border border-yellow-200",children:[(0,a.jsx)("h2",{className:"font-semibold text-yellow-800 mb-4",children:"Wallet Information"}),(0,a.jsxs)("div",{className:"space-y-4",children:[(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Account ID:"}),(0,a.jsxs)("div",{className:"flex items-center bg-white p-3 rounded-lg border",children:[(0,a.jsx)("p",{className:"text-sm flex-1",children:s.accountId}),(0,a.jsx)("button",{onClick:()=>g(s.accountId,"accountId"),className:"ml-2 text-gray-500 hover:text-gray-700",children:j.accountId?(0,a.jsx)(x.Z,{className:"h-5 w-5 text-green-500"}):(0,a.jsx)(o.Z,{className:"h-5 w-5"})})]})]}),s.seedPhrase?(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Seed Phrase:"}),(0,a.jsxs)("div",{className:"flex items-center bg-white p-3 rounded-lg border",children:[(0,a.jsx)("p",{className:"text-sm flex-1 break-all ".concat(h.seedPhrase?"":"blur-sm"),children:s.seedPhrase}),(0,a.jsx)("button",{onClick:()=>g(s.seedPhrase,"seedPhrase"),className:"ml-2 text-gray-500 hover:text-gray-700",children:j.seedPhrase?(0,a.jsx)(x.Z,{className:"h-5 w-5 text-green-500"}):(0,a.jsx)(o.Z,{className:"h-5 w-5"})}),(0,a.jsx)("button",{onClick:()=>v("seedPhrase"),className:"ml-2 text-gray-500 hover:text-gray-700",children:h.seedPhrase?(0,a.jsx)(d.Z,{className:"h-5 w-5"}):(0,a.jsx)(i.Z,{className:"h-5 w-5"})})]})]}):(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Seed Phrase:"}),(0,a.jsx)("div",{className:"bg-blue-50 p-4 rounded-lg border border-blue-200",children:(0,a.jsxs)("p",{className:"text-sm text-blue-800",children:["This account wasn't created or imported (using Secret Phrase) via Nearer, so no encrypted secret phrase is currently available.",(0,a.jsx)("br",{}),(0,a.jsx)("br",{}),"Rest assured, your original secret phrase should still work as a recovery method if you haven't removed it from your Near account."]})})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Private Key:"}),(0,a.jsxs)("div",{className:"flex items-center bg-white p-3 rounded-lg border",children:[(0,a.jsx)("p",{className:"text-sm flex-1 break-all ".concat(h.privateKey?"":"blur-sm"),children:s.secretKey}),(0,a.jsx)("button",{onClick:()=>g(s.secretKey,"privateKey"),className:"ml-2 text-gray-500 hover:text-gray-700",children:j.privateKey?(0,a.jsx)(x.Z,{className:"h-5 w-5 text-green-500"}):(0,a.jsx)(o.Z,{className:"h-5 w-5"})}),(0,a.jsx)("button",{onClick:()=>v("privateKey"),className:"ml-2 text-gray-500 hover:text-gray-700",children:h.privateKey?(0,a.jsx)(d.Z,{className:"h-5 w-5"}):(0,a.jsx)(i.Z,{className:"h-5 w-5"})})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-1",children:"Public Key:"}),(0,a.jsxs)("div",{className:"flex items-center bg-white p-3 rounded-lg border",children:[(0,a.jsx)("p",{className:"text-sm flex-1 break-all",children:s.publicKey}),(0,a.jsx)("button",{onClick:()=>g(s.publicKey,"publicKey"),className:"ml-2 text-gray-500 hover:text-gray-700",children:j.publicKey?(0,a.jsx)(x.Z,{className:"h-5 w-5 text-green-500"}):(0,a.jsx)(o.Z,{className:"h-5 w-5"})})]})]}),(0,a.jsx)("div",{className:"mt-4 p-4 bg-red-50 border border-red-200 rounded-lg",children:(0,a.jsx)("p",{className:"text-red-600 text-sm font-medium",children:"⚠️ Warning: Store this information securely. Never share your private key or seed phrase with anyone!"})})]})]}),(0,a.jsx)("div",{className:"flex flex-col space-y-4",children:(0,a.jsx)("button",{onClick:p,className:"w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:-translate-y-0.5",children:"Logout"})})]})]})})}):(0,a.jsx)("div",{className:"min-h-screen p-8 bg-gray-50 flex items-center justify-center",children:(0,a.jsx)(c.w,{children:(0,a.jsx)(n.G,{children:b||"Loading..."})})})}t(29159)}},function(e){e.O(0,[736,888,179],function(){return e(e.s=38356)}),_N_E=e.O()}]);