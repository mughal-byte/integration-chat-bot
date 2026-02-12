// script.js - Complete Chat Widget with DOM Creation
// Load GSAP dynamically
// Bootstrap
const bootstrap = document.createElement("link");
bootstrap.rel = "stylesheet";
bootstrap.href =
  "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css";
document.head.appendChild(bootstrap);

// Font Awesome
const fa = document.createElement("link");
fa.rel = "stylesheet";
fa.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
document.head.appendChild(fa);

// GSAP
const gsapScript = document.createElement("script");
gsapScript.src =
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js";
gsapScript.integrity =
  "sha512-NcZdtrT77bJr4STcmsGAESr06BYGE8woZdSdEgqnpyqac7sugNO+Tr4bGwGF3MsnEkGKhU2KL2xh6Ec+BqsaHA==";
gsapScript.crossOrigin = "anonymous";
gsapScript.referrerPolicy = "no-referrer";

document.head.appendChild(gsapScript);

(function () {
  "use strict";

  // === CONFIG ===
  const CONFIG = {
    AI_BASE_URL: "https://api.yourdomain.com/ai",
    AI_TEXT_MODEL: "2",
    COMP: "15",
    API_KEY: " your_api_key_here ",

  };

  console.log(CONFIG.SESSION_KEY);
  // === DOM Elements Storage ===
  const elements = {};

  // === State Management ===
  const CHAT_STATE_KEY = "chat_state";
  const CHAT_MIN_KEY = "chat_minimized";
  const CHAT_MESSAGES_KEY = "chat_messages";
  const SOUND_ENABLED_KEY = "sound_enabled";
  const USER_FEEDBACK_KEY = "user_feedback";

  let moreMenuTimeoutId = null;
  let isAssistantInfoShown = false;
  let sessionUserMessages = 0;

  // === CSS Styles ===
  function addChatWidgetStyles() {
    const style = document.createElement("style");
    style.textContent = `
        :root {
            --primary: #3255a0;
            --primary-dark: #1e3a8a;
            --primary-light: #93c5fd;
            --success: #22c55e;
            --danger: #ef4444;
            --warning: #f59e0b;
            --text-primary: #111827;
            --text-secondary: #6b7280;
            --text-muted: #9ca3af;
            --bg-primary: #ffffff;
            --bg-secondary: #f9fafb;
            --bg-tertiary: #f3f4f6;
            --border: #e5e7eb;
            --radius: 12px;
            --radius-lg: 20px;
            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            --shadow-md: 0 10px 15px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 20px 25px rgba(0, 0, 0, 0.15);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Chat Container Styles */
        .chat-container,
        .chat-conversation {
            display: none;
            position: fixed;
            bottom: 10px;
            right: 30px;
            width: 385px;
            height: 670px;
            border-radius: 24px;
            box-shadow: var(--shadow-md);
            flex-direction: column;
            overflow: hidden;
            z-index: 1100;
            transform: scale(0.95);
            opacity: 0;
            transition: var(--transition);
        }
        
        .chat-container.show,
        .chat-conversation.show {
            transform: scale(1);
            opacity: 1;
        }
        
        .chat-container {
            background: linear-gradient(180deg, #9e9e9e 0%, #cfcfcf 35%, #eeeeee 70%, #f7f7f7 100%);
        }
        
        .chat-conversation {
            background: #f7f7f7;
            z-index: 1200;
        }

        /* Chat Header Styles */
        .chat-header {
            padding: 34px 20px 18px;
        }
        
        .chat-header .minimize-btn:hover {
            opacity: 1;
        }

        /* Conversation Header Styles */
        .conversation-header {
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            position: relative;
        }
        
        .conv-icons {
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 20px;
            color: var(--text-primary);
            cursor: pointer;
        }
        
        .conv-icons span {
            opacity: 0.8;
            transition: var(--transition);
        }
        
        .conv-icons span:hover {
            opacity: 1;
        }

        /* Text Support Card */
        #textSupportCard {
            position: fixed;
            left: 110px;
            top: 30px;
            z-index: 5;
            border-radius: 19px;
            cursor: pointer;
            padding: 4px;
            background: white;
            box-shadow: var(--shadow-sm);
        }
        
        #textSupportCard .d-flex {
            align-items: center;
            justify-content: space-between;
        }
        
        #textSupportCard .bg-dark {
            width: 28px;
            height: 28px;
            position: relative;
            border-radius: 50%;
            padding: 4px;
        }
        
        #textSupportCard .support-pill-dot {
            position: absolute;
            top: 1px;
            left: 15px;
            width: 10px;
            height: 10px;
            background: #22c55e;
            border-radius: 50%;
            border: 2px solid white;
        }
        
        #textSupportCard .fw-bold {
            padding: 4px;
        }
        
        #assistantInfo {
            display: none;
        }
        
        #assistantInfo .small {
            margin-left: 40px;
            margin-bottom: 8px;
        }
        
        #ratingButtons {
            display: none;
            justify-content: center;
            align-items: center;
        }
        
        #ratingButtons button {
            border: 1px solid #ddd;
            padding: 4px;
            width: 25%;
            margin: 0 8px;
            border-radius: 10px;
        }

        /* Conversation Body Styles */
        .conversation-body {
            position: relative;
            flex: 1;
            padding: 12px 16px;
            overflow-y: auto;
        }
        
        .conversation-body::before {
            content: "";
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            height: 40px;
            pointer-events: none;
            background: linear-gradient(180deg, rgba(243, 245, 249, 0.95) 0%, rgba(243, 245, 249, 0) 100%);
            backdrop-filter: blur(8px);
            opacity: 0;
            transition: opacity 0.15s ease;
            z-index: 1;
        }
        
        .conversation-body.has-shadow::before {
            opacity: 1;
        }

        /* Chatbox Inline Styles */
        .chatbox-inline {
            background: white;
            border-radius: var(--radius);
            box-shadow: var(--shadow-md);
            padding: 20px 18px 24px;
            margin: 0 0 16px 25px;
            transition: var(--transition);
        }
        
        .chatbox-inline:hover {
            transform: translateY(-3px);
        }
        
        .avatars {
            display: flex;
            margin-bottom: 18px;
        }
        
        .avatars img {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 2px solid white;
            margin-left: -10px;
            object-fit: cover;
            transition: transform 0.2s ease;
        }
        
        .avatars img:hover {
            transform: scale(1.1);
            z-index: 1;
        }
        
        .avatars img:first-child {
            margin-left: 0;
        }
        
        .status {
            position: relative;
        }
        
        .status::after {
            content: "";
            width: 10px;
            height: 10px;
            background: #22c55e;
            border-radius: 50%;
            position: absolute;
            right: 2px;
            bottom: 2px;
            border: 2px solid white;
        }
        
        .chatbox-inline h1 {
            font-size: 20px;
            margin-bottom: 14px;
            text-align: left;
        }
        
        .subtitle {
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 12px;
            text-align: left;
        }
        
        .desc {
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 18px;
            text-align: left;
        }
        
        .chatbox-inline .btn {
            padding: 10px;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .chatbox-inline .btn-primary {
            margin-bottom: 10px;
        }

        /* Chat Bubble Styles */
        .chat-bubble {
            display: inline-block;
            max-width: 80%;
            width: fit-content;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 9px;
            font-size: 13px;
            line-height: 1.4;
            word-break: break-word;
            white-space: pre-wrap;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            backface-visibility: hidden;
            transform: translateZ(0);
        }
        
        .chat-bubble:hover {
            opacity: 0.95;
        }
        
        .chat-bubble.user {
            display: block;
            margin-left: auto;
            text-align: right;
            background: #3255a0;
            color: white;
            border-radius: 9px;
            margin-top: 12px;
        }
        
        .chat-ai-row {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .chat-ai-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #edeef1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .chat-ai-avatar img {
            width: 18px;
            height: 18px;
            filter: invert(31%) sepia(96%) saturate(7494%) hue-rotate(205deg) brightness(97%) contrast(101%);
        }
        
        .chat-bubble.ai {
            margin: 0;
            background: #dee0e6;
            color: var(--text-primary);
            border-radius: 24px;
        }
        
        .ai-icon {
            width: 22px;
            height: 22px;
            object-fit: contain;
            flex-shrink: 0;
            margin-top: 2px;
            display: block;
        }
        
        /* AI Text */
        .ai-text {
            flex: 1;
            min-width: 0;
            word-break: break-word;
            white-space: pre-wrap;
            line-height: 1.5;
        }
        
        /* Typing Indicator */
        .typing {
            display: flex;
            gap: 4px;
            align-items: center;
            padding: 8px 12px;
            background: #f3f4f6;
            border-radius: 16px;
            width: fit-content;
        }
        
        .typing span {
            width: 6px;
            height: 6px;
            background: #9ca3af;
            border-radius: 50%;
            display: inline-block;
            animation: typing 1s infinite ease-in-out;
        }
        
        .typing span:nth-child(2) {
            animation-delay: 0.15s;
        }
        
        .typing span:nth-child(3) {
            animation-delay: 0.3s;
        }
        
        @keyframes typing {
            0%, 80%, 100% {
                transform: translateY(0);
                opacity: 0.4;
            }
            40% {
                transform: translateY(-3px);
                opacity: 1;
            }
        }

        .input-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .file-preview-container {
            display: none;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 8px;
            max-height: 100px;
            overflow-y: auto;
            padding: 4px 0;
        }
        
        .file-preview-container.show {
            display: flex;
        }

        /* File Preview Styles */
        .file-preview-item {
            position: relative;
            width: 50px;
            height: 50px;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            cursor: pointer;
            flex-shrink: 0;
            left: 10px;
        }
        
        .file-preview-item:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        
        .file-preview-item img,
        .file-preview-item video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .file-preview-item .file-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background-color: #f8f9fa;
        }
        
        .file-preview-item .remove-btn {
            position: absolute;
            top: 1px;
            right: 1px;
            width: 14px;
            height: 14px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 8px;
            color: #333;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .file-preview-item:hover .remove-btn {
            opacity: 1;
        }
        
        /* Modal Styles */
        .close-overlay,
        .email-subscription-overlay,
        .feedback-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1400;
            backdrop-filter: blur(4px);
        }
        
        .close-overlay {
            border-radius: 24px;
        }
        
        .email-subscription-overlay,
        .feedback-overlay {
            z-index: 2000;
        }
        
        .close-overlay.show,
        .email-subscription-overlay.show,
        .feedback-overlay.show {
            display: flex;
        }
        
        .close-modal,
        .email-subscription-modal,
        .feedback-modal {
            background: white;
            border-radius: 18px;
            padding: 24px 20px 20px;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            max-width: 90%;
            width: 320px;
            text-align: center;
            animation: modalSlideIn 0.3s ease;
        }
        
        .email-subscription-modal,
        .feedback-modal {
            width: 400px;
            padding: 32px;
        }
        
        .feedback-modal {
            width: 380px;
            padding: 28px;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .close-modal-icon-wrap,
        .email-modal-icon-wrap,
        .feedback-modal-icon-wrap {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 18px;
            font-size: 34px;
            color: #6b7280;
        }
        
        .email-modal-icon-wrap,
        .feedback-modal-icon-wrap {
            width: 64px;
            height: 64px;
            margin-bottom: 20px;
        }
        
        .email-modal-icon-wrap i,
        .feedback-modal-icon-wrap i {
            font-size: 28px;
            color: #3255a0;
        }
        
        .feedback-modal-icon-wrap i.fa-thumbs-up {
            color: #22c55e;
        }
        
        .feedback-modal-icon-wrap i.fa-thumbs-down {
            color: #ef4444;
        }
        
        .feedback-modal-icon-wrap i.fa-heart {
            color: #ec4899;
        }
        
        .close-modal h3,
        .email-subscription-modal h3,
        .feedback-modal h3 {
            font-size: 17px;
            margin-bottom: 22px;
            line-height: 1.4;
            color: var(--text-primary);
        }
        
        .email-subscription-modal h3,
        .feedback-modal h3 {
            font-size: 22px;
            margin-bottom: 8px;
        }
        
        .email-subscription-modal p,
        .feedback-modal p {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        
        .close-modal button.primary {
            width: 100%;
            padding: 12px 0;
            border-radius: 999px;
            border: none;
            background: var(--primary-dark);
            color: #d82b2b;
            font-weight: 600;
            cursor: pointer;
            font-size: 15px;
            transition: var(--transition);
        }
        
        .close-modal button.primary:hover {
            background: #b91c1c;
        }
        
        .modal-close-x {
            position: absolute;
            top: 10px;
            right: 14px;
            cursor: pointer;
            font-size: 18px;
            color: #050505;
            transition: var(--transition);
        }
        
        .email-subscription-modal .modal-close-x,
        .feedback-modal .modal-close-x {
            top: 16px;
            right: 16px;
            font-size: 20px;
        }
        
        .modal-close-x:hover {
            color: #6b7280;
        }
        
        .email-subscription-modal form,
        .feedback-modal form {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .email-subscription-modal input[type="email"],
        .feedback-modal textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: var(--transition);
            font-family: inherit;
            resize: vertical;
            min-height: 80px;
            max-height: 150px;
        }
        
        .email-subscription-modal input[type="email"]:focus,
        .feedback-modal textarea:focus {
            border-color: #3255a0;
            box-shadow: 0 0 0 3px rgba(50, 85, 160, 0.1);
        }
        
        .subscribe-btn,
        .submit-feedback-btn {
            background-color: #212529;
            color: #ffffff;
            padding: 12px 28px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .subscribe-btn:hover,
        .submit-feedback-btn:hover {
            background-color: #000000;
            transform: translateY(-2px);
        }
        
        .subscribe-btn:active,
        .submit-feedback-btn:active {
            transform: scale(0.98);
        }
        
        .feedback-type-buttons {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .feedback-type-btn {
            flex: 1;
            padding: 12px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .feedback-type-btn:hover {
            border-color: #3255a0;
            transform: translateY(-2px);
        }
        
        .feedback-type-btn.active {
            border-color: #3255a0;
            background: #f8fafc;
        }
        
        .feedback-type-btn i {
            font-size: 24px;
        }
        
        .feedback-type-btn .btn-title {
            font-weight: 600;
            font-size: 14px;
        }
        
        .feedback-type-btn .btn-desc {
            font-size: 12px;
            color: #6b7280;
        }
        
        /* More Menu */
        .more-icon {
            cursor: pointer;
            font-size: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #555;
            transition: var(--transition);
            position: relative;
        }
        
        .more-icon:hover {
            color: var(--text-primary);
        }
        
        .more-menu {
            position: absolute;
            top: calc(100% - 8px);
            right: -150px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 200px;
            padding: 6px 0;
            display: none;
            z-index: 1500;
            opacity: 0;
            transform: translateY(0);
            transition: var(--transition);
        }
        
        .more-menu.show {
            display: block;
            opacity: 1;
            transform: translateY(0);
        }
        
        .more-menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            cursor: pointer;
            font-size: 14px;
            color: var(--text-primary);
            transition: background 0.2s ease;
        }
        
        .more-menu-item:hover {
            background: #f3f4f6;
        }
        
        .more-menu-item i {
            font-size: 16px;
            width: 20px;
            text-align: center;
            color: #6b7280;
        }
        
        .more-menu-item:hover i {
            color: var(--text-primary);
        }
        
        /* Sound Toggle Switch */
        .sound-toggle-wrapper {
            justify-content: space-between;
            cursor: default;
        }
        
        .sound-toggle-wrapper:hover {
            background: transparent;
        }
        
        .custom-toggle {
            position: relative;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            margin-left: auto;
            flex-shrink: 0;
        }
        
        .sound-toggle-wrapper {
            pointer-events: auto;
        }
        
        .sound-toggle-wrapper>*:not(.custom-toggle) {
            pointer-events: none;
        }
        
        .toggle-input {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .toggle-slider {
            position: relative;
            width: 44px;
            height: 24px;
            background: #d1d5db;
            border-radius: 24px;
            transition: background 0.3s ease;
            cursor: pointer;
        }
        
        .toggle-slider::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: #ffffff;
            border-radius: 50%;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .toggle-input:checked+.toggle-slider {
            background: #3255a0;
        }
        
        .toggle-input:checked+.toggle-slider::before {
            transform: translateX(20px);
            box-shadow: 0 2px 6px rgba(50, 85, 160, 0.4);
        }
        
        .toggle-input:focus+.toggle-slider {
            outline: 2px solid rgba(50, 85, 160, 0.3);
            outline-offset: 2px;
        }
        
        .toggle-input:active+.toggle-slider::before {
            width: 22px;
        }
        
        .toggle-input:checked:active+.toggle-slider::before {
            transform: translateX(18px);
        }
        
        /* Responsive Styles */
        @media (max-width: 1200px) {
            .chat-container,
            .chat-conversation {
                width: 350px;
                height: 600px;
            }
        }
        
        @media (max-width: 992px) {
            .chat-container,
            .chat-conversation {
                width: 320px;
                height: 580px;
            }
        }
        
        @media (max-width: 768px) {
            .chat-container,
            .chat-conversation {
                width: 100%;
                height: 100vh;
                right: 0;
                bottom: 0;
                border-radius: 0;
                max-width: 100%;
                left: 0;
                margin: 0 auto;
            }
            
            .conversation-body {
                padding-bottom: 90px;
            }
            
            .conversation-header {
                padding: 10px 12px;
            }
            
            .conversation-header .conv-icons {
                gap: 10px;
            }
            
            #textSupportCard {
                left: 50% !important;
                transform: translateX(-50%);
                top: 14px !important;
                scale: 0.95;
                width: 90%;
                max-width: 320px;
            }
            
            .chatbox-inline h1 {
                font-size: 22px;
            }
            
            .chatbox-inline .desc {
                font-size: 14px;
            }
            
            .chat-footer {
                width: calc(100% - 24px);
                margin: 0 12px 12px;
                border-radius: 16px;
            }
            
            .feedback-modal {
                width: 90%;
                padding: 24px;
            }
        }
        
        @media (max-width: 576px) {
            .header-title {
                font-size: 32px;
            }
            
            .chat-card.modern {
                padding: 14px;
            }
            
            .icon-wrap {
                width: 70px;
                height: 36px;
            }
            
            .text-wrap .title {
                font-size: 13px;
            }
            
            .text-wrap .desc {
                font-size: 12px;
            }
            
            .conversation-header {
                padding: 10px 12px;
            }
            
            .chat-body,
            .conversation-body {
                padding: 10px 12px;
            }
            
            .chat-footer {
                height: auto;
                padding: 10px 12px;
            }
            
            .feedback-type-buttons {
                flex-direction: column;
            }
        }
        
        @media (max-width: 480px) {
            #textSupportCard {
                scale: 0.9;
                width: 95%;
            }
            
            .chat-container,
            .chat-conversation {
                width: 100%;
                height: 100vh;
                max-height: 100vh;
            }
            
            .conversation-header {
                padding: 8px 10px;
            }
            
            .conversation-body {
                padding: 8px 10px;
            }
            
            .conversation-footer {
                padding: 8px 10px;
            }
            
            .conversation-input-wrapper {
                padding: 8px 10px;
            }
            
            .welcome-pills {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin: 0 10px;
            }
            
            .welcome-pills button {
                flex: 1 1 48%;
                font-size: 13px;
            }
            
            .conversation-input {
                font-size: 14px;
            }
            
            .conversation-send,
            .emoji-button,
            .plus-button {
                width: 36px;
                height: 36px;
            }
            
            .feedback-modal {
                padding: 20px;
            }
        }
        
        @media (max-width: 380px) {
            .welcome-pills button {
                flex: 1 1 100%;
                font-size: 12px;
            }
            
            .welcome-info-box {
                font-size: 12px;
            }
        }
        
        @media (max-width: 320px) {
            .chat-container,
            .chat-conversation {
                width: 100%;
                height: 100vh;
            }
            
            .conversation-header {
                padding: 6px 8px;
            }
            
            .conv-icons {
                gap: 8px;
            }
            
            .conversation-body {
                padding: 6px 8px;
            }
            
            .conversation-footer {
                padding: 6px 8px;
            }
            
            .conversation-input-wrapper {
                padding: 6px 8px;
            }
            
            .conversation-input {
                font-size: 13px;
            }
            
            .conversation-send,
            .emoji-button,
            .plus-button {
                width: 32px;
                height: 32px;
            }
        }
        
        @media (max-height: 600px) and (orientation: landscape) {
            .chat-container,
            .chat-conversation {
                height: 90vh;
                max-height: 500px;
            }
            
            .conversation-body {
                padding-bottom: 70px;
            }
        }
        
        @media (max-width: 480px) {
            .chatbox-inline {
                margin: 0;
                width: 100%;
            }
            
            .welcome-info-box,
            .welcome-pills {
                margin-left: 10px;
                margin-right: 10px;
            }
        }

        /* Additional essential styles */
        .position-relative {
            position: relative !important;
        }
        
        .position-absolute {
            position: absolute !important;
        }
        
        .d-flex {
            display: flex !important;
        }
        
        .justify-content-between {
            justify-content: space-between !important;
        }
        
        .align-items-center {
            align-items: center !important;
        }
        
        .fw-bold {
            font-weight: bold !important;
        }
        
        .text-dark {
            color: #212529 !important;
        }
        
        .flex-column {
            flex-direction: column !important;
        }
        
        .flex-grow-1 {
            flex-grow: 1 !important;
        }
        
        .overflow-auto {
            overflow: auto !important;
        }
        
        .bg-white {
            background-color: white !important;
        }
        
        .rounded-\[20px\] {
            border-radius: 20px !important;
        }
        
        .shadow {
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
        }
        
        .align-items-start {
            align-items: flex-start !important;
        }
        
        .justify-content-center {
            justify-content: center !important;
        }
        
        .rounded-pill {
            border-radius: 50rem !important;
        }
        
        .border {
            border: 1px solid #dee2e6 !important;
        }
        
        .border-white {
            border-color: white !important;
        }
        
        .rounded-circle {
            border-radius: 50% !important;
        }
        
        .bg-dark {
            background-color: #212529 !important;
        }
        
        .mt-3 {
            margin-top: 1rem !important;
        }
        
        .gap-2 {
            gap: 0.5rem !important;
        }
        
        .top-0 {
            top: 0 !important;
        }
        
        .start-0 {
            left: 0 !important;
        }
        
        .p-2 {
            padding: 0.5rem !important;
        }
        
        .mt-2 {
            margin-top: 0.5rem !important;
        }
        
        .mb-2 {
            margin-bottom: 0.5rem !important;
        }
        
        .fw-normal {
            font-weight: normal !important;
        }
        
        .me-3 {
            margin-right: 1rem !important;
        }
        
        .ms-3 {
            margin-left: 1rem !important;
        }
        
        .w-25 {
            width: 25% !important;
        }
        
        .p-1 {
            padding: 0.25rem !important;
        }
        
        .shadow-sm {
            box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
        }
        
        .card {
            position: relative;
            display: flex;
            flex-direction: column;
            min-width: 0;
            word-wrap: break-word;
            background-color: #fff;
            background-clip: border-box;
            border: 1px solid rgba(0,0,0,.125);
            border-radius: 0.25rem;
        }
    `;
    document.head.appendChild(style);
  }
  // === Utility Functions ===
  function createElement(tag, attributes = {}, children = []) {
    const el = document.createElement(tag);

    Object.keys(attributes).forEach((key) => {
      if (key === "style" && typeof attributes[key] === "object") {
        Object.assign(el.style, attributes[key]);
      } else if (key === "className") {
        el.className = attributes[key];
      } else if (key.startsWith("on")) {
        el[key] = attributes[key];
      } else if (key !== "children") {
        el.setAttribute(key, attributes[key]);
      }
    });

    // Handle children - FIX THIS
    if (children) {
      if (Array.isArray(children)) {
        children.forEach((child) => {
          if (child && child !== null) {
            if (typeof child === "string") {
              el.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
              el.appendChild(child);
            } else if (Array.isArray(child)) {
              child.forEach((subChild) => {
                if (subChild && subChild instanceof Node) {
                  el.appendChild(subChild);
                }
              });
            }
          }
        });
      } else if (typeof children === "string") {
        el.appendChild(document.createTextNode(children));
      } else if (children instanceof Node) {
        el.appendChild(children);
      }
    }

    return el;
  }

  function saveMessage(msg) {
    try {
      const raw = localStorage.getItem(CHAT_MESSAGES_KEY) || "[]";
      const messages = JSON.parse(raw);
      messages.push(msg);
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
      checkMessageCountAndToggleAssistantInfo();
    } catch (e) {
      console.error("Failed to save message", e);
    }
  }

  function playNotificationSound() {
    if (!isSoundEnabled()) return;

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "triangle";
      osc1.frequency.value = 1000;
      gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = "triangle";
      osc2.frequency.value = 1400;
      gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.35,
      );

      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.2);
      osc2.start(audioCtx.currentTime + 0.15);
      osc2.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.log("Could not play sound:", e);
    }
  }

  function isSoundEnabled() {
    const soundSetting = localStorage.getItem(SOUND_ENABLED_KEY);
    return soundSetting !== "0";
  }

  function setSoundEnabled(enabled) {
    localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "1" : "0");
    updateSoundUI();
  }

  // === UI Creation Functions ===

  function createFloatingButton() {
    const button = createElement("div", {
      id: "chatButton",
      style: {
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "60px",
        height: "60px",
        background: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        cursor: "pointer",
        zIndex: "1000",
        transition: "all 0.3s ease",
      },
    });

    const img = createElement("img", {
      src: "public/images/Vector.png",
      alt: "",
      style: { width: "40px", height: "40px" },
    });

    // Add event listeners directly
    button.addEventListener("click", function () {
      window.openProductExpert();
    });

    button.addEventListener("mouseover", function () {
      this.style.transform = "scale(1.1)";
      this.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
    });

    button.addEventListener("mouseout", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
    });

    button.addEventListener("mousedown", function () {
      this.style.transform = "scale(0.95)";
    });

    button.addEventListener("mouseup", function () {
      this.style.transform = "scale(1.1)";
    });

    button.appendChild(img);
    return button;
  }

  function createChatPage() {
    const container = createElement("div", {
      id: "chatPage",
      className: "chat-container",
      style: { display: "none" },
    });

    // Header
    const header = createElement("div", {
      className:
        "chat-header position-relative d-flex justify-content-between align-items-center fw-bold text-dark",
      style: { padding: "34px 20px 18px" },
    });

    const minimizeBtn = createElement(
      "span",
      {
        style: {
          position: "absolute",
          top: "0",
          right: "0",
          fontSize: "20px",
          cursor: "pointer",
          padding: "20px",
          opacity: "0.75",
          transition: "all 0.3s ease",
        },
      },
      [createElement("i", { className: "fa-solid fa-minus" })],
    );

    // Events attach karo
    minimizeBtn.onclick = minimizeChat;
    minimizeBtn.onmouseover = () => (minimizeBtn.style.opacity = "1");
    minimizeBtn.onmouseout = () => (minimizeBtn.style.opacity = "0.75");

    const title = createElement(
      "h2",
      {
        style: {
          marginTop: "16px",
          marginLeft: "4px",
          fontSize: "45px",
          fontWeight: "bold",
        },
      },
      ["Chat with us!"],
    );

    header.appendChild(minimizeBtn);
    header.appendChild(title);

    // Body
    const body = createElement("div", {
      className: "chat-body d-flex flex-column flex-grow-1 overflow-auto",
      style: { padding: "16px", gap: "16px" },
    });

    // Text Support Card
    const textSupportCard = createElement("div", {
      className: "chat-card modern bg-white rounded-[20px] shadow",
      onmouseover:
        'this.style.transform="translateY(-3px)"; this.style.boxShadow="0 8px 20px rgba(0,0,0,0.1)"',
      onmouseout:
        'this.style.transform="translateY(0)"; this.style.boxShadow="0 10px 30px rgba(0,0,0,0.08)"',
      style: {
        padding: "18px",
        display: "flex",
        borderRadius: "10px",
        flexDirection: "column",
        gap: "18px",
        transition: "all 0.3s ease",
        cursor: "pointer",
      },
    });

    const cardTop = createElement("div", {
      className: "card-top d-flex align-items-start",
      style: { gap: "14px" },
    });

    const iconWrap = createElement("div", {
      className:
        "icon-wrap position-relative d-flex align-items-center justify-content-center rounded-pill",
      onmouseover: 'this.style.transform="scale(1.05)"',
      onmouseout: 'this.style.transform="scale(1)"',
      style: {
        width: "85px",
        height: "44px",
        background: "#000",
        transition: "transform 0.3s ease",
      },
    });

    const iconImg = createElement("img", {
      src: "public/images/Vector.png",
      style: { width: "25px", height: "25px" },
      alt: "",
    });

    const onlineDot = createElement("span", {
      className:
        "online-dot position-absolute rounded-circle border border-white",
      style: {
        top: "3px",
        left: "3px",
        width: "11px",
        height: "11px",
        background: "#22c55e",
        borderWidth: "2px",
      },
    });

    iconWrap.appendChild(iconImg);
    iconWrap.appendChild(onlineDot);

    const textWrap = createElement("div", { className: "text-wrap" });
    const titleDiv = createElement(
      "div",
      {
        className: "title",
        style: {
          fontWeight: "600",
          fontSize: "14px",
          marginBottom: "4px",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
      ["Customer support"],
    );

    const descDiv = createElement(
      "div",
      {
        style: {
          color: "#6b7280",
          fontSize: "13px",
          lineHeight: "1.5",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
      [
        "Let's chat with our Customer Support AI! It’s here to help you instantly with any questions or issues.",
      ],
    );

    textWrap.appendChild(titleDiv);
    textWrap.appendChild(descDiv);

    cardTop.appendChild(iconWrap);
    cardTop.appendChild(textWrap);

    // In createChatPage() function, update the chatButton section:
    const chatButton = createElement(
      "button",
      {
        style: {
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          background: "#111827",
          color: "#ffffff",
          transition: "transform 0.3s ease",
        },
      },
      [
        "Let's Chat ",
        createElement("i", { className: "fa-solid fa-arrow-right" }),
      ],
    );

    // Then add event listeners AFTER
    setTimeout(() => {
      chatButton.addEventListener("click", function () {
        window.openFullChat();
      });

      chatButton.addEventListener("mouseover", function () {
        this.style.background = "#1f2937";
        this.style.transform = "translateY(-2px)";
      });

      chatButton.addEventListener("mouseout", function () {
        this.style.background = "#111827";
        this.style.transform = "translateY(0)";
      });
    }, 100);

    textSupportCard.appendChild(cardTop);
    textSupportCard.appendChild(chatButton);

    // System Status Card
    const systemCard = createElement("div", {
      onclick: "openFullChat()",
      onmouseover:
        'this.style.transform="translateY(-3px)"; this.style.boxShadow="0 12px 30px rgba(0,0,0,0.12)"',
      onmouseout:
        'this.style.transform="translateY(0)"; this.style.boxShadow="0 2px 6px rgba(0,0,0,0.08)"',
      style: {
        background: "white",
        borderRadius: "18px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
    });

    const systemLeft = createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "500",
          fontSize: "14px",
        },
      },
      [
        createElement("i", { className: "fa-solid fa-gear" }),
        createElement("span", {}, ["System Status"]),
      ],
    );

    systemCard.appendChild(systemLeft);
    systemCard.appendChild(
      createElement("i", { className: "fa-solid fa-arrow-right" }),
    );

    body.appendChild(textSupportCard);
    body.appendChild(systemCard);

    // Navigation
    const nav = createElement("div", {
      style: {
        height: "70px",
        width: "330px",
        marginLeft: "22px",
        marginBottom: "12px",
        borderRadius: "25px",
        border: "1px solid #ccc",
        borderTop: "1px solid #eee",
        background: "white",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      },
    });

    const homeNav = createElement(
      "div",
      {
        onmouseout: 'this.style.background="transparent"',
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "12px",
          color: "#6b7280",
          padding: "8px",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "all 0.3s ease",
        },
      },
      [
        createElement("img", {
          src: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
          alt: "Home",
          style: { width: "20px", height: "20px", marginBottom: "4px" },
        }),
        createElement("span", {}, ["Home"]),
      ],
    );

    const chatsNav = createElement(
      "div",
      {
        onclick: "openFullChat()", // This is already there
        onmouseout: 'this.style.background="transparent"',
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "12px",
          color: "#070707",
          padding: "8px",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "all 0.3s ease",
        },
      },
      [
        createElement("i", {
          class: "fa-solid fa-comments",
          style: { fontSize: "20px", marginBottom: "4px" },
          onclick: "window.openFullChat()",
        }),
        createElement("span", {}, ["Chats"]),
      ]

    );

    nav.appendChild(homeNav);
    nav.appendChild(chatsNav);

    // Footer
    // Add this after creating chatsNav, before appending it to nav
    chatsNav.addEventListener("click", function (e) {
      // Prevent event bubbling if needed
      e.stopPropagation();
      window.openFullChat();
    });

    // Also add specific click handler for the image
    setTimeout(() => {
      const chatImg = chatsNav.querySelector("img");
      if (chatImg) {
        chatImg.addEventListener("click", function (e) {
          e.stopPropagation();
          window.openFullChat();
        });
      }
    }, 100);
    const footer = createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "12px",
          gap: "6px",
          marginBottom: "8px",
        },
      },
      [
        createElement("span", {}, ["Powered by "]),
        createElement("img", {
          src: "public/images/Vector.png",
          alt: "ChatBot Logo",
          style: { width: "12px", height: "12px", opacity: "0.7" },
        }),
        createElement(
          "span",
          {
            style: { fontSize: "12px", color: "#555" },
          },
          ["Buildors.com"],
        ),
      ],
    );

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(nav);
    container.appendChild(footer);

    return container;
  }

  function createFullChat() {
    const container = createElement("div", {
      id: "fullChat",
      className: "chat-conversation",
      style: { display: "none" },
    });

    // Header
    const header = createElement("div", { className: "conversation-header" });

    const leftIcons = createElement("div", { className: "conv-icons" });

    // Back arrow
    const backArrow = createElement("span", {}, [
      createElement("i", { className: "fa-solid fa-arrow-left" }),
    ]);

    leftIcons.appendChild(backArrow);

    // More icon
    const moreIcon = createElement(
      "span",
      {
        className: "more-icon",
      },
      [createElement("i", { className: "fa-solid fa-ellipsis" })],
    );

    const moreMenu = createMoreMenu();
    moreIcon.appendChild(moreMenu);

    leftIcons.appendChild(moreIcon);

    // Text Support Card
    const textSupportCard = createElement("div", {
      id: "textSupportCard",
      className: "card shadow-sm p-1",
      style: {
        position: "fixed",
        left: "110px",
        top: "30px",
        zIndex: "5",
        borderRadius: "19px",
        cursor: "pointer",
        padding: "4px",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      },
    });

    const cardContent = createElement("div", {
      className: "d-flex align-items-center justify-content-between",
    });
    const iconContainer = createElement("div", {
      className: "bg-dark border position-relative rounded-circle p-1",
    });
    iconContainer.appendChild(
      createElement("img", {
        src: "public/images/Vector.png",
        height: "17",
        style: { marginBottom: "10px" },
        alt: "",
      }),
    );
    iconContainer.appendChild(
      createElement("span", { className: "support-pill-dot" }),
    );

    cardContent.appendChild(iconContainer);
    cardContent.appendChild(
      createElement("div", { className: "fw-bold p-1" }, ["Feedback ?"]),
    );

    const assistantInfo = createElement("div", {
      id: "assistantInfo",
      style: { display: "none" },
    });
    assistantInfo.appendChild(
      createElement(
        "div",
        {
          className: "small fw-normal mb-2",
          style: { marginLeft: "40px" },
        },
        ["AI assistant"],
      ),
    );

    const ratingButtons = createElement("div", {
      id: "ratingButtons",
      className: "d-flex justify-content-center align-items-center",
      style: { display: "none" },
    });

    const likeBtn = createElement(
      "button",
      {
        type: "button",
        className: "border me-3 p-1 w-25",
        style: { borderRadius: "10px" },
      },
      [createElement("i", { className: "fa-regular fa-thumbs-up" })],
    );

    const dislikeBtn = createElement(
      "button",
      {
        type: "button",
        className: "border ms-3 p-1 w-25",
        style: { borderRadius: "10px" },
      },
      [createElement("i", { className: "fa-regular fa-thumbs-down" })],
    );

    ratingButtons.appendChild(likeBtn);
    ratingButtons.appendChild(dislikeBtn);
    assistantInfo.appendChild(ratingButtons);

    textSupportCard.appendChild(cardContent);
    textSupportCard.appendChild(assistantInfo);

    const rightIcons = createElement("div", { className: "conv-icons" });

    // Minimize button
    const minimizeBtn = createElement("span", {}, [
      createElement("i", { className: "fa-solid fa-minus" }),
    ]);
    rightIcons.appendChild(minimizeBtn);

    // Close button
    const closeBtn = createElement(
      "span",
      {
        className: "close-btn",
      },
      [createElement("i", { className: "fa-solid fa-times" })],
    );
    rightIcons.appendChild(closeBtn);

    header.appendChild(leftIcons);
    header.appendChild(textSupportCard);
    header.appendChild(rightIcons);

    // ==================== BODY CONTENT ====================
    // Body
    const body = createElement("div", {
      id: "conversationBody",
      className: "conversation-body",
    });

    // Initial content
    const chatboxInline = createElement("div", { className: "chatbox-inline" });

    const avatars = createElement("div", { className: "avatars" });
    ["12", "32", "45"].forEach((img) => {
      avatars.appendChild(
        createElement("img", {
          src: `https://i.pravatar.cc/100?img=${img}`,
        }),
      );
    });

    const statusAvatar = createElement("div", { className: "status" });
    statusAvatar.appendChild(
      createElement("img", {
        src: "https://i.pravatar.cc/100?img=8",
      }),
    );
    avatars.appendChild(statusAvatar);

    const welcomeTitle = createElement("h1", {}, ["Hello 👋"]);
    const subtitle = createElement("div", { className: "subtitle" }, [
      "Welcome to Buildors!",
    ]);
    const desc = createElement("div", { className: "desc" }, [
      // "Sign up free or talk with our product experts.",
    ]);

    const freeTrialBtn = createElement(
      // "button",
      // {
      //   className: "btn-danger",
      //   style: {
      //     width: "100%",
      //     padding: "12px",
      //     borderRadius: "10px",
      //     border: "none",
      //     cursor: "pointer",
      //     fontSize: "15px",
      //     fontWeight: "600",
      //     marginBottom: "10px",
      //     display: "flex",
      //     alignItems: "center",
      //     justifyContent: "center",
      //     gap: "8px",
      //     color: "#ffffff",
      //     transition: "transform 0.3s ease",
      //     background: "#f22727",
      //   },
      // },
      // ["Free Trial"],
    );

    const letsChatBtn = createElement(
      "button",
      {
        style: {
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: "600",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          background: "#111827",
          color: "#ffffff",
          transition: "transform 0.3s ease",
        },
      },
      ["💬 Let's Chat"],
    );

    chatboxInline.appendChild(avatars);
    chatboxInline.appendChild(welcomeTitle);
    chatboxInline.appendChild(subtitle);
    chatboxInline.appendChild(desc);
    chatboxInline.appendChild(freeTrialBtn);
    chatboxInline.appendChild(letsChatBtn);

    const welcomeInfo = createElement(
      "div",
      {
        style: {
          background:
            "linear-gradient(180deg, rgba(243, 245, 249, 0.95) 0%, rgba(251, 252, 253, 0) 100%)",
          padding: "10px",
          marginLeft: "24px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          fontSize: "13px",
          width: "250px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "12px",
          transition: "all 0.3s ease",
        },
      },
      [
        "I'm your AI assistant, and I'm ready to help. You can pick an option below or just type your question. The more specific you are, the better I can help!",
      ],
    );

    const welcomePills = createElement("div", {
      className: "welcome-pills",
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginLeft: "24px",
        marginBottom: "12px",
      },
    });

    [
      "Discover Chatbot",
      "Our Other Solutions",
      "Partner Program",
      "Contact Us",
    ].forEach((text) => {
      welcomePills.appendChild(
        createElement(
          "button",
          {
            style: {
              border: "1px solid #ddd",
              background: "#fff",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "0.3s ease",
            },
          },
          [text],
        ),
      );
    });

    body.appendChild(chatboxInline);
    body.appendChild(welcomeInfo);
    body.appendChild(welcomePills);

    // ==================== FOOTER CONTENT ====================
    // Footer
    const footer = createElement("div", {
      className: "conversation-footer",
      style: {
        borderTop: "1px solid #e8edf4",
        background: "linear-gradient(180deg, #f7f9fc 0%, #f3f5f9 100%)",
        padding: "12px 14px",
        position: "relative",
      },
    });

    const inputWrapper = createElement("div", {
      className: "conversation-input-wrapper",
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: "10px",
        padding: "10px 14px",
        borderRadius: "16px",
        border: "1px solid #d8e0ec",
        background: "#ffffff",
        boxShadow:
          "0 10px 30px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        transition: "all 0.3s ease",
      },
    });

    const filePreview = createElement("div", {
      id: "filePreview",
      className: "mt-3",
    });
    const inputPreview = createElement("div", {
      id: "inputPreview",
      className: "d-flex flex-wrap gap-2 position-absolute start-0 p-2",
      style: { zIndex: "10", bottom: "75px", left: "0px", maxWidth: "100%" },
    });

    const plusButton = createElement(
      "button",
      {
        type: "button",
        style: {
          background: "#eef1f7",
          border: "1px solid #d8e0ec",
          cursor: "pointer",
          fontSize: "16px",
          color: "#4b5563",
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: "0",
          transition: "all 0.3s ease",
        },
      },
      [createElement("i", { className: "fa-solid fa-plus" })],
    );

    const textarea = createElement("textarea", {
      id: "chatInput",
      rows: "1",
      placeholder: "Write a message...",
      style: {
        flex: "1",
        border: "none",
        outline: "none",
        background: "transparent",
        fontSize: "14px",
        lineHeight: "1.5",
        minHeight: "30px",
        maxHeight: "120px",
        resize: "none",
        padding: "0",
        color: "#0f172a",
        width: "100%",
      },
    });

    const emojiButton = createElement(
      "button",
      {
        type: "button",
        style: {
          background: "#eef1f7",
          border: "1px solid #d8e0ec",
          cursor: "pointer",
          fontSize: "16px",
          color: "#5b5c5e",
          transition: "all 0.3s ease",
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: "0",
        },
      },
      [createElement("i", { className: "fa-regular fa-face-smile" })],
    );

    const sendButton = createElement(
      "button",
      {
        type: "button",
        style: {
          background: "linear-gradient(135deg, #111827, #1f2937)",
          color: "white",
          border: "1px solid #0f172a",
          padding: "8px 12px",
          fontSize: "13px",
          borderRadius: "10px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          width: "34px",
          height: "34px",
        },
      },
      [createElement("i", { className: "fa-solid fa-arrow-up" })],
    );

    inputWrapper.appendChild(filePreview);
    inputWrapper.appendChild(plusButton);
    inputWrapper.appendChild(inputPreview);
    inputWrapper.appendChild(textarea);
    inputWrapper.appendChild(emojiButton);
    inputWrapper.appendChild(sendButton);

    // Emoji Picker
    const emojiPicker = createElement("div", {
      id: "emojiPicker",
      style: {
        position: "absolute",
        bottom: "90px",
        right: "32px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        padding: "8px 10px",
        display: "none",
        gap: "4px",
        flexWrap: "wrap",
        maxWidth: "220px",
        zIndex: "1300",
      },
    });

    ["😀", "😁", "😂", "😊", "😍", "🤔", "👍", "🙏", "🎉", "❤️"].forEach(
      (emoji) => {
        emojiPicker.appendChild(
          createElement(
            "span",
            {
              style: {
                fontSize: "20px",
                padding: "4px",
                cursor: "pointer",
                borderRadius: "4px",
                transition: "all 0.3s ease",
              },
            },
            [emoji],
          ),
        );
      },
    );

    const poweredBy = createElement(
      "div",
      {
        className:
          "d-flex justify-content-center align-items-center gap-2 mt-2",
      },
      [
        createElement(
          "span",
          {
            style: { fontSize: "12px", color: "#555" },
          },
          ["Powered by "],
        ),
        createElement("img", {
          src: "public/images/Vector.png",
          alt: "Logo",
          style: { width: "13px", height: "13px" },
        }),
        createElement(
          "span",
          {
            style: { fontSize: "12px", color: "#555" },
          },
          ["Buildors.com"],
        ),
      ],
    );

    footer.appendChild(inputWrapper);
    footer.appendChild(emojiPicker);
    footer.appendChild(poweredBy);

    // Modals
    const closeModal = createCloseModal();
    const emailModal = createEmailModal();
    const feedbackModal = createFeedbackModal();

    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);
    container.appendChild(closeModal);
    container.appendChild(emailModal);
    container.appendChild(feedbackModal);

    // Add event listeners AFTER elements are created
    setTimeout(() => {
      // Back arrow click
      if (backArrow)
        backArrow.addEventListener("click", function () {
          window.backToChatPage();
        });

      // More icon click
      if (moreIcon)
        moreIcon.addEventListener("click", function (e) {
          e.stopPropagation();
          window.toggleMoreMenu();
        });

      // Text support card click
      if (textSupportCard)
        textSupportCard.addEventListener("click", function () {
          window.toggleAssistantInfo();
        });

      // Minimize button click
      if (minimizeBtn)
        minimizeBtn.addEventListener("click", function () {
          window.minimizeChat();
        });

      // Close button click
      if (closeBtn)
        closeBtn.addEventListener("click", function () {
          window.openCloseConfirm();
        });

      // Rating buttons click
      if (likeBtn)
        likeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          window.rateHeaderFeedback("up");
          window.openFeedbackModal("positive");
        });

      if (dislikeBtn)
        dislikeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          window.rateHeaderFeedback("down");
          window.openFeedbackModal("negative");
        });

      // Plus button
      if (plusButton)
        plusButton.addEventListener("click", function () {
          window.handlePlusClick();
        });

      // Emoji button
      if (emojiButton)
        emojiButton.addEventListener("click", function () {
          window.toggleEmojiPicker();
        });

      // Send button
      if (sendButton)
        sendButton.addEventListener("click", function () {
          window.sendMessage();
        });

      // Let's Chat button
      if (letsChatBtn)
        letsChatBtn.addEventListener("click", function () {
          window.hideChatboxInline();
          window.openFullChat();
        });

      // Free Trial button hover effects
      if (freeTrialBtn) {
        freeTrialBtn.addEventListener("mouseover", function () {
          this.style.background = "#e21b1b";
          this.style.transform = "translateY(-2px)";
        });

        freeTrialBtn.addEventListener("mouseout", function () {
          this.style.background = "#f22727";
          this.style.transform = "translateY(0)";
        });
      }

      // Lets Chat button hover effects
      if (letsChatBtn) {
        letsChatBtn.addEventListener("mouseover", function () {
          this.style.background = "#1f2937";
          this.style.transform = "translateY(-2px)";
        });

        letsChatBtn.addEventListener("mouseout", function () {
          this.style.background = "#111827";
          this.style.transform = "translateY(0)";
        });
      }

      // Welcome pills buttons hover effects
      const welcomePillButtons = welcomePills.querySelectorAll("button");
      welcomePillButtons.forEach((button) => {
        button.addEventListener("mouseover", function () {
          this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        });

        button.addEventListener("mouseout", function () {
          this.style.boxShadow = "none";
        });
      });

      // Welcome info hover effects
      if (welcomeInfo) {
        welcomeInfo.addEventListener("mouseover", function () {
          this.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
        });

        welcomeInfo.addEventListener("mouseout", function () {
          this.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
        });
      }

      // Emoji picker items
      const emojiSpans = emojiPicker.querySelectorAll("span");
      emojiSpans.forEach((span) => {
        span.addEventListener("click", function () {
          const emoji = this.textContent;
          window.addEmoji(emoji);
        });

        span.addEventListener("mouseover", function () {
          this.style.background = "#f3f4f6";
          this.style.transform = "scale(1.2)";
        });

        span.addEventListener("mouseout", function () {
          this.style.background = "";
          this.style.transform = "scale(1)";
        });
      });

      // Send button hover effects
      if (sendButton) {
        sendButton.addEventListener("mouseover", function () {
          this.style.background = "linear-gradient(135deg, #0b1220, #111827)";
          this.style.transform = "translateY(-1px)";
        });

        sendButton.addEventListener("mouseout", function () {
          this.style.background = "linear-gradient(135deg, #111827, #1f2937)";
          this.style.transform = "translateY(0)";
        });
      }

      // Plus button hover effects
      if (plusButton) {
        plusButton.addEventListener("mouseover", function () {
          this.style.background = "#e5eaf2";
          this.style.color = "#0f172a";
        });

        plusButton.addEventListener("mouseout", function () {
          this.style.background = "#eef1f7";
          this.style.color = "#4b5563";
        });

        plusButton.addEventListener("mousedown", function () {
          this.style.transform = "scale(0.97)";
        });

        plusButton.addEventListener("mouseup", function () {
          this.style.transform = "scale(1)";
        });
      }
    }, 100);

    return container;
  }

  function createMoreMenu() {
    const menu = createElement("div", {
      id: "moreMenu",
      className: "more-menu",
    });

    const soundToggle = createElement(
      "div",
      {
        className: "more-menu-item sound-toggle-wrapper",
      },
      [
        createElement("i", {
          id: "soundIcon",
          className: "fa-solid fa-volume-high",
        }),
        createElement("span", { id: "soundText" }, ["Sound"]),
        createElement("label", { className: "custom-toggle" }, [
          createElement("input", {
            type: "checkbox",
            id: "soundToggle",
            className: "toggle-input",
            checked: true,
          }),
          createElement("div", { className: "toggle-slider" }),
        ]),
      ],
    );

    const emailItem = createElement(
      "div",
      {
        className: "more-menu-item",
      },
      [
        createElement("i", { className: "fa-solid fa-envelope" }),
        createElement("span", {}, ["Send transcript"]),
      ],
    );

    menu.appendChild(soundToggle);
    menu.appendChild(emailItem);

    // Add event listeners AFTER the menu is appended to DOM
    setTimeout(() => {
      const soundToggleInput = document.getElementById("soundToggle");
      if (soundToggleInput) {
        soundToggleInput.addEventListener("change", handleSoundToggle);
      }

      emailItem.addEventListener("click", function (e) {
        e.stopPropagation();
        window.openEmailSubscription();
      });
    }, 100);

    return menu;
  }

  function createCloseModal() {
    const overlay = createElement("div", {
      id: "closeOverlay",
      className: "close-overlay",
      style: { display: "none" },
    });

    const modal = createElement("div", { className: "close-modal" });

    const closeX = createElement(
      "span",
      {
        className: "modal-close-x",
      },
      [createElement("i", { className: "fa-solid fa-times" })],
    );

    const iconWrap = createElement("div", {
      className: "close-modal-icon-wrap",
    });
    iconWrap.appendChild(
      createElement("i", { className: "fa-solid fa-arrow-right-from-bracket" }),
    );

    const title = createElement("h3", {}, [
      "Do you really want to close",
      createElement("br"),
      document.createTextNode("the chat?"),
    ]);

    const closeButton = createElement(
      "button",
      {
        className: "primary",
        style: {
          background: "#d82b2b",
          color: "white",
        },
      },
      ["Close the Chat"],
    );

    modal.appendChild(closeX);
    modal.appendChild(iconWrap);
    modal.appendChild(title);
    modal.appendChild(closeButton);
    overlay.appendChild(modal);

    // Add event listeners
    setTimeout(() => {
      closeX.addEventListener("click", function (e) {
        e.stopPropagation();
        window.hideCloseConfirm();
      });

      closeButton.addEventListener("click", function (e) {
        e.stopPropagation();
        window.confirmCloseChat();
      });

      // Close when clicking outside modal
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          window.hideCloseConfirm();
        }
      });
    }, 100);

    return overlay;
  }

  function createEmailModal() {
    const overlay = createElement("div", {
      id: "emailSubscriptionOverlay",
      className: "email-subscription-overlay",
      style: { display: "none" },
    });

    const modal = createElement("div", {
      className: "email-subscription-modal",
    });

    const closeX = createElement(
      "span",
      {
        className: "modal-close-x",
      },
      [createElement("i", { className: "fa-solid fa-times" })],
    );

    const iconWrap = createElement("div", {
      className: "email-modal-icon-wrap",
    });
    iconWrap.appendChild(
      createElement("i", { className: "fa-solid fa-envelope" }),
    );

    const title = createElement("h3", {}, ["Subscribe to Email Updates"]);
    const description = createElement("p", {}, [
      "Get notified about new features and updates",
    ]);

    const form = createElement("form", {
      id: "emailSubscriptionForm",
    });

    const emailInput = createElement("input", {
      type: "email",
      id: "emailInput",
      placeholder: "Enter your email address",
      required: true,
    });

    const subscribeButton = createElement(
      "button",
      {
        type: "submit",
        className: "subscribe-btn",
        style: {
          background: "#212529",
          color: "#ffffff",
          padding: "12px 28px",
          fontSize: "16px",
          fontWeight: "600",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginTop: "10px",
        },
      },
      ["Subscribe"],
    );

    form.appendChild(emailInput);
    form.appendChild(subscribeButton);

    modal.appendChild(closeX);
    modal.appendChild(iconWrap);
    modal.appendChild(title);
    modal.appendChild(description);
    modal.appendChild(form);
    overlay.appendChild(modal);

    // Add event listeners
    setTimeout(() => {
      closeX.addEventListener("click", function (e) {
        e.stopPropagation();
        window.hideEmailSubscription();
      });

      // Close when clicking outside modal
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          window.hideEmailSubscription();
        }
      });

      // Form submission
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        window.handleEmailSubscription(e);
      });

      // Subscribe button hover effects
      subscribeButton.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#000000";
        this.style.transform = "translateY(-2px)";
      });

      subscribeButton.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#212529";
        this.style.transform = "translateY(0)";
      });

      subscribeButton.addEventListener("mousedown", function () {
        this.style.transform = "scale(0.98)";
      });

      subscribeButton.addEventListener("mouseup", function () {
        this.style.transform = "scale(1)";
      });
    }, 100);

    return overlay;
  }



  function doPost(e) {
    try {
      var email = e.parameter.email || "";
      if (!email || !email.includes("@")) {
        return ContentService.createTextOutput("Error: Invalid email").setMimeType(ContentService.MimeType.TEXT);
      }

      var subject = "Subscription Confirmed! 🎉";
      var body = `
<h2>Thank you for subscribing!</h2>
<p>Hi,</p>
<p>You have successfully subscribed with <b>${email}</b>.</p>
<p>We will keep you updated with new features and news from Buildors.</p>
<p style="color:#666; font-size:0.9em;">Didn't subscribe? Just ignore this email.</p>
<p>Best regards,<br>Buildors Team</p>
    `;

      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: body
      });

      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    } catch (err) {
      return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
    }
  }

  function createFeedbackModal() {
    const overlay = createElement("div", {
      id: "feedbackOverlay",
      className: "feedback-overlay",
      style: { display: "none" },
    });

    const modal = createElement("div", {
      className: "feedback-modal",
    });

    const closeX = createElement(
      "span",
      {
        className: "modal-close-x",
      },
      [createElement("i", { className: "fa-solid fa-times" })],
    );

    const iconWrap = createElement("div", {
      className: "feedback-modal-icon-wrap",
      id: "feedbackIconWrap",
    });
    iconWrap.appendChild(
      createElement("i", {
        id: "feedbackIcon",
        className: "fa-solid fa-heart",
      }),
    );

    const title = createElement("h3", { id: "feedbackTitle" }, [
      "Share Your Feedback",
    ]);
    const description = createElement("p", { id: "feedbackDescription" }, [
      "Your feedback helps us improve our service",
    ]);

    const form = createElement("form", {
      id: "feedbackForm",
    });

    const feedbackTypeButtons = createElement("div", {
      className: "feedback-type-buttons",
      id: "feedbackTypeButtons",
    });

    const feedbackTextarea = createElement("textarea", {
      id: "feedbackText",
      placeholder: "Please share your detailed feedback here...",
      rows: "1",
      required: true,
    });

    const hiddenFeedbackType = createElement("input", {
      type: "hidden",
      id: "feedbackType",
      value: "",
    });

    const submitButton = createElement(
      "button",
      {
        type: "submit",
        className: "submit-feedback-btn",
        id: "submitFeedbackBtn",
        style: {
          background: "#212529",
          color: "#ffffff",
          padding: "12px 28px",
          fontSize: "16px",
          fontWeight: "600",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginTop: "10px",
        },
      },
      ["Submit Feedback"],
    );

    form.appendChild(feedbackTypeButtons);
    form.appendChild(hiddenFeedbackType);
    form.appendChild(feedbackTextarea);
    form.appendChild(submitButton);

    modal.appendChild(closeX);
    modal.appendChild(iconWrap);
    modal.appendChild(title);
    modal.appendChild(description);
    modal.appendChild(form);
    overlay.appendChild(modal);

    // Add event listeners
    setTimeout(() => {
      closeX.addEventListener("click", function (e) {
        e.stopPropagation();
        window.hideFeedbackModal();
      });

      // Close when clicking outside modal
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          window.hideFeedbackModal();
        }
      });

      // Form submission
      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email || !email.includes("@")) {
          alert("Please enter a valid email address.");
          return;
        }

        subscribeButton.disabled = true;
        subscribeButton.textContent = "Subscribing...";

        try {
          const formData = new FormData();
          formData.append("email", email);

          const response = await fetch("YOUR_APPS_SCRIPT_WEB_APP_URL_HERE", {  // ← yahan URL daal
            method: "POST",
            body: formData
          });

          const result = await response.text();

          if (result === "Success") {
            alert("Thank you! Subscription confirmed — check your inbox. 🎉");
            window.hideEmailSubscription();
            form.reset();
          } else {
            alert("Error: " + result);
          }
        } catch (err) {
          alert("Network error. Please try again.");
          console.error(err);
        } finally {
          subscribeButton.disabled = false;
          subscribeButton.textContent = "Subscribe";
        }
      });

      // Feedback type button clicks
      feedbackTypeButtons.addEventListener("click", function (e) {
        const button = e.target.closest(".feedback-type-btn");
        if (button) {
          // Remove active class from all buttons
          document.querySelectorAll(".feedback-type-btn").forEach((btn) => {
            btn.classList.remove("active");
          });

          // Add active class to clicked button
          button.classList.add("active");

          // Update hidden input
          const type = button.getAttribute("data-type");
          document.getElementById("feedbackType").value = type;

          // Update UI based on type
          const icon = document.getElementById("feedbackIcon");
          const title = document.getElementById("feedbackTitle");
          const description = document.getElementById("feedbackDescription");

          switch (type) {
            case "positive":
              icon.className = "fa-solid fa-thumbs-up";
              title.textContent = "Positive Feedback";
              description.textContent = "What did you like about our service?";
              break;
            case "negative":
              icon.className = "fa-solid fa-thumbs-down";
              title.textContent = "Negative Feedback";
              description.textContent = "What can we improve?";
              break;
            case "suggestion":
              icon.className = "fa-solid fa-lightbulb";
              title.textContent = "Share Your Suggestion";
              description.textContent = "We'd love to hear your ideas!";
              break;
          }
        }
      });

      // Submit button hover effects
      submitButton.addEventListener("mouseover", function () {
        this.style.backgroundColor = "#000000";
        this.style.transform = "translateY(-2px)";
      });

      submitButton.addEventListener("mouseout", function () {
        this.style.backgroundColor = "#212529";
        this.style.transform = "translateY(0)";
      });

      submitButton.addEventListener("mousedown", function () {
        this.style.transform = "scale(0.98)";
      });

      submitButton.addEventListener("mouseup", function () {
        this.style.transform = "scale(1)";
      });

      // Feedback type button hover effects
      document.querySelectorAll(".feedback-type-btn").forEach((btn) => {
        btn.addEventListener("mouseover", function () {
          if (!this.classList.contains("active")) {
            this.style.borderColor = "#3255a0";
          }
        });

        btn.addEventListener("mouseout", function () {
          if (!this.classList.contains("active")) {
            this.style.borderColor = "#d1d5db";
          }
        });
      });
    }, 100);

    return overlay;
  }

  // === Main Functions ===

  function initializeChat() {
    try {
      // Create and append all elements to body
      addChatWidgetStyles();

      document.body.appendChild(createFloatingButton());
      document.body.appendChild(createChatPage());
      document.body.appendChild(createFullChat());

      // Store references to key elements
      elements.chatPage = document.getElementById("chatPage");
      elements.fullChat = document.getElementById("fullChat");
      elements.conversationBody = document.getElementById("conversationBody");
      elements.chatInput = document.getElementById("chatInput");
      elements.soundToggle = document.getElementById("soundToggle");

      // Initialize event listeners
      setupChatInputEvents();
      setupConversationScrollShadow();
      updateSoundUI();

      if (elements.soundToggle) {
        elements.soundToggle.addEventListener("change", handleSoundToggle);
      }

      checkMessageCountAndToggleAssistantInfo();
      initWelcomePills();

      // Load existing messages
      loadMessages();
    } catch (error) {
      console.error("Error in initializeChat:", error);
      // Fallback - create a simple chat button
      const fallbackButton = document.createElement("div");
      fallbackButton.id = "fallbackChatButton";
      fallbackButton.innerHTML = "💬 Chat";
      fallbackButton.style.cssText =
        "position:fixed;bottom:30px;right:30px;background:#3255a0;color:white;padding:15px;border-radius:50%;cursor:pointer;z-index:1000;";
      fallbackButton.onclick = function () {
        alert("Chat widget failed to load. Please refresh the page.");
      };
      document.body.appendChild(fallbackButton);
    }
  }

  function loadMessages() {
    try {
      const raw = localStorage.getItem(CHAT_MESSAGES_KEY) || "[]";
      const messages = JSON.parse(raw);

      if (!messages || !Array.isArray(messages)) {
        localStorage.setItem(CHAT_MESSAGES_KEY, "[]");
        return;
      }

      messages.forEach((msg) => {
        if (msg && msg.text) {
          renderMessage(msg);
        }
      });
    } catch (error) {
      console.error("Error loading messages:", error);
      localStorage.setItem(CHAT_MESSAGES_KEY, "[]");
    }
  }

  function renderMessage(msg) {
    if (!elements.conversationBody) return;

    if (msg.sender === "ai") {
      const row = createElement("div", { className: "chat-ai-row" });

      const avatar = createElement("div", { className: "chat-ai-avatar" });
      avatar.appendChild(
        createElement("img", {
          src: "public/images/Vector.png",
          alt: "AI",
        }),
      );

      const bubble = createElement("div", { className: "chat-bubble ai" });
      const innerDiv = createElement("div", { className: "ai-bubble-inner" });

      const textSpan = createElement("span", { className: "ai-text" });
      textSpan.textContent = msg.text;

      innerDiv.appendChild(textSpan);
      bubble.appendChild(innerDiv);
      row.appendChild(avatar);
      row.appendChild(bubble);
      elements.conversationBody.appendChild(row);

      if (isAssistantInfoShown) {
        const ratingButtons = document.getElementById("ratingButtons");
        if (ratingButtons) ratingButtons.style.display = "flex";
      }
    } else {
      const bubble = createElement("div", { className: "chat-bubble user" });
      bubble.textContent = msg.text;
      elements.conversationBody.appendChild(bubble);
    }

    elements.conversationBody.scrollTop =
      elements.conversationBody.scrollHeight;
  }

  // === Event Handlers ===

  window.openProductExpert = function () {
    const lastState = localStorage.getItem(CHAT_STATE_KEY) || "chatPage";
    setMinimized(false);

    if (lastState === "fullChat") {
      openFullChat();
    } else {
      openChatPage();
    }
  };

  window.openChatPage = function () {
    hideAllChatViews();
    if (elements.chatPage) {
      elements.chatPage.style.display = "flex";
      setTimeout(() => {
        elements.chatPage.classList.add("show");
      }, 10);
    }
    saveChatState("chatPage");
  };

  window.minimizeChat = function () {
    if (elements.chatPage && elements.chatPage.style.display === "flex") {
      elements.chatPage.classList.remove("show");
      setTimeout(() => {
        elements.chatPage.style.display = "none";
      }, 300);
    }
    if (elements.fullChat && elements.fullChat.style.display === "flex") {
      elements.fullChat.classList.remove("show");
      setTimeout(() => {
        elements.fullChat.style.display = "none";
      }, 300);
    }
    setMinimized(true);
  };

  window.openFullChat = function () {
    if (elements.chatPage) elements.chatPage.classList.remove("show");
    if (elements.fullChat) {
      elements.fullChat.style.display = "flex";
      setTimeout(() => {
        elements.fullChat.classList.add("show");
      }, 10);
    }

    // Show welcome content when opening full chat
    const intro = document.querySelector(".chatbox-inline");
    const welcomeInfo = document.querySelector(".welcome-info-box");
    const welcomePills = document.querySelector(".welcome-pills");

    if (intro) intro.style.display = "block";
    if (welcomeInfo) welcomeInfo.style.display = "block";
    if (welcomePills) welcomePills.style.display = "flex";

    checkMessageCountAndToggleAssistantInfo();

    if (elements.conversationBody) {
      elements.conversationBody.scrollTop = 0;
    }

    saveChatState("fullChat");
    setMinimized(false);
  };

  window.backToChatPage = function () {
    if (elements.fullChat) {
      elements.fullChat.classList.remove("show");
      setTimeout(() => {
        openChatPage();
      }, 300);
    }
  };
  async function createTypingEffect(text) {
    return new Promise((resolve) => {
      try {
        // Create the AI message row structure
        const row = createElement("div", { className: "chat-ai-row" });

        // Avatar
        const avatar = createElement("div", { className: "chat-ai-avatar" });
        avatar.appendChild(
          createElement("img", {
            src: "public/images/Vector.png",
            alt: "AI",
          })
        );

        // Bubble container
        const bubble = createElement("div", { className: "chat-bubble ai" });
        const innerDiv = createElement("div", { className: "ai-bubble-inner" });

        // Create a span for the typing effect
        const textSpan = createElement("span", {
          className: "ai-text typing-active"
        });

        // Create cursor element
        const cursor = createElement("span", {
          className: "typing-cursor",
          style: {
            display: "inline-block",
            width: "2px",
            height: "16px",
            backgroundColor: "#3255a0",
            marginLeft: "2px",
            animation: "blink 1s infinite"
          }
        });

        innerDiv.appendChild(textSpan);
        innerDiv.appendChild(cursor);
        bubble.appendChild(innerDiv);
        row.appendChild(avatar);
        row.appendChild(bubble);

        // Add to conversation body
        elements.conversationBody.appendChild(row);
        elements.conversationBody.scrollTop = elements.conversationBody.scrollHeight;

        // Typing animation variables
        let i = 0;
        const speed = 30; // Typing speed in milliseconds

        function typeWriter() {
          if (i < text.length) {
            textSpan.innerHTML += text.charAt(i);
            i++;
            // Auto-scroll as text appears
            elements.conversationBody.scrollTop = elements.conversationBody.scrollHeight;
            setTimeout(typeWriter, speed);
          } else {
            // Typing complete - remove cursor
            if (cursor && cursor.parentNode) {
              cursor.remove();
            }
            textSpan.classList.remove("typing-active");
            resolve();
          }
        }

        // Start typing after a small delay
        setTimeout(typeWriter, 100);

      } catch (err) {
        console.error("Error in typing effect:", err);
        // Fallback
        const fallbackRow = createAiBubble(text);
        elements.conversationBody.appendChild(fallbackRow);
        resolve();
      }
    });
  }

  // Add this CSS for cursor animation
  function addTypingCursorStyles() {
    const style = document.createElement("style");
    style.textContent = `
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    .typing-cursor {
      animation: blink 1s infinite;
    }
    
    .chat-bubble.ai .ai-text {
      display: inline;
    }
  `;
    document.head.appendChild(style);
  }

  // Call this in your initializeChat function
  addTypingCursorStyles();
  window.hideChatboxInline = function () {
    const el = document.querySelector(".chatbox-inline");
    if (el) el.style.display = "none";
  };

  window.sendMessage = async function () {
    if (!elements.chatInput) return;

    const message = elements.chatInput.value.trim();
    if (!message) {
      elements.chatInput.style.borderColor = "#ef4444";
      setTimeout(() => {
        elements.chatInput.style.borderColor = "";
      }, 500);
      return;
    }

    if (message.length > 5000) {
      alert("Message is too long. Please keep it under 5000 characters.");
      return;
    }

    const sendButton = document.querySelector(".conversation-send");
    if (sendButton && sendButton.disabled) return;

    if (sendButton) {
      sendButton.disabled = true;
      sendButton.style.opacity = "0.5";
      sendButton.style.cursor = "not-allowed";
    }

    const intros = document.querySelectorAll(".chatbox-inline, .welcome-pills");
    intros.forEach((intro) => (intro.style.display = "none"));

    const userBubble = createElement("div", { className: "chat-bubble user" });
    userBubble.textContent = message;
    elements.conversationBody.appendChild(userBubble);
    elements.conversationBody.scrollTop =
      elements.conversationBody.scrollHeight;

    elements.chatInput.value = "";
    elements.chatInput.style.height = "auto";
    elements.chatInput.style.height = "30px";
    elements.chatInput.focus();

    const inputPreview = document.getElementById("inputPreview");
    if (inputPreview) {
      inputPreview.innerHTML = "";
    }

    saveMessage({ sender: "user", text: message });
    sessionUserMessages++;

    await simulateAiResponse(message);

    if (sendButton) {
      sendButton.disabled = false;
      sendButton.style.opacity = "1";
      sendButton.style.cursor = "pointer";
    }
  };

  async function simulateAiResponse(userMessage) {
    const typingDiv = createElement("div", { className: "typing" });
    typingDiv.innerHTML = "<span></span><span></span><span></span>";
    elements.conversationBody.appendChild(typingDiv);
    elements.conversationBody.scrollTop = elements.conversationBody.scrollHeight;

    try {
      let sessionKey = localStorage.getItem("chat_session_key");

      if (!sessionKey) {
        sessionKey = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("chat_session_key", sessionKey);
      }

      // Direct API call to Buildors

      const url = `${CONFIG.AI_BASE_URL}?ai_text_model=${CONFIG.AI_TEXT_MODEL}&comp=${CONFIG.COMP}&query=${encodeURIComponent(userMessage)}&session_key=${sessionKey}&api_key=${CONFIG.API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      // Remove typing indicator
      typingDiv.remove();

      let aiReply = data.response || data.result || data.reply || data.message || data.text;
      if (!aiReply || aiReply.trim().length === 0) {
        aiReply = "I received your message but couldn't generate a proper response.";
      }

      const cleanReply = aiReply.trim();

      // Create AI bubble with typing effect - AWAIT it properly
      await createTypingEffect(cleanReply, 5, 0);

      // Save message AFTER typing effect completes
      saveMessage({ sender: "ai", text: cleanReply });
      playNotificationSound();

      if (data.session_key) {
        localStorage.setItem("chat_session_key", data.session_key);
      }

      checkMessageCountAndToggleAssistantInfo();
    } catch (err) {
      typingDiv.remove();
      console.error("❌ Error getting AI response:", err);

      let errorMessage = "Sorry, I'm having trouble responding. ";
      if (err.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to server. Please check if the server is running.";
      } else if (err.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage += "Error: " + err.message;
      }

      // Show error with typing effect too
      await createTypingEffect(errorMessage);
      saveMessage({ sender: "ai", text: errorMessage });
      playNotificationSound();
    }
  }

  function createAiBubble(text) {
    const aiBubble = createElement("div", { className: "chat-bubble ai" });
    const innerDiv = createElement("div", { className: "ai-bubble-inner" });
    const textSpan = createElement("span", { className: "ai-text" });
    textSpan.textContent = text;
    innerDiv.appendChild(textSpan);
    aiBubble.appendChild(innerDiv);
    return aiBubble;
  }

  function setupChatInputEvents() {
    if (!elements.chatInput) return;

    const autoResize = () => {
      elements.chatInput.style.height = "auto";
      elements.chatInput.style.height =
        Math.min(elements.chatInput.scrollHeight, 160) + "px";
    };

    elements.chatInput.addEventListener("input", autoResize);
    autoResize();

    elements.chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        window.sendMessage();
      }
    });
  }

  function setupConversationScrollShadow() {
    if (!elements.conversationBody) return;

    const toggleShadow = () => {
      if (elements.conversationBody.scrollTop > 4) {
        elements.conversationBody.classList.add("has-shadow");
      } else {
        elements.conversationBody.classList.remove("has-shadow");
      }
    };

    elements.conversationBody.addEventListener("scroll", toggleShadow);
    toggleShadow();
  }

  window.toggleMoreMenu = function () {
    const menu = document.getElementById("moreMenu");
    if (!menu) return;

    const isShowing = menu.classList.contains("show");
    clearTimeout(moreMenuTimeoutId);

    document.querySelectorAll(".more-menu.show").forEach((m) => {
      if (m !== menu) m.classList.remove("show");
    });

    if (isShowing) {
      menu.classList.remove("show");
    } else {
      menu.classList.add("show");
      moreMenuTimeoutId = setTimeout(() => {
        menu.classList.remove("show");
      }, 2000);
    }
  };

  window.rateHeaderFeedback = function (value) {
    const upBtn = document.querySelector("#ratingButtons button:first-child i");
    const downBtn = document.querySelector(
      "#ratingButtons button:last-child i",
    );
    if (!upBtn || !downBtn) return;

    if (value === "up") {
      upBtn.classList.remove("fa-regular");
      upBtn.classList.add("fa-solid");
      downBtn.classList.remove("fa-solid");
      downBtn.classList.add("fa-regular");
    } else {
      downBtn.classList.remove("fa-regular");
      downBtn.classList.add("fa-solid");
      upBtn.classList.remove("fa-solid");
      upBtn.classList.add("fa-regular");
    }
  };

  // Yeh existing function hai, isme sirf condition change karo
  window.toggleAssistantInfo = function () {
    const raw = localStorage.getItem(CHAT_MESSAGES_KEY) || "[]";
    const messages = JSON.parse(raw);

    // YEH LINE CHANGE KARO: 5 se 3 kar do
    if (messages.length < 3) {
      return;
    }

    const assistantInfo = document.getElementById("assistantInfo");
    const ratingButtons = document.getElementById("ratingButtons");
    const card = document.getElementById("textSupportCard");

    isAssistantInfoShown = !isAssistantInfoShown;

    if (isAssistantInfoShown) {
      assistantInfo.style.display = "block";
      gsap.fromTo(
        assistantInfo,
        { opacity: 0, height: 0 },
        { opacity: 1, height: "auto", duration: 0.5, ease: "bounce.out" },
      );
      gsap.to(card, {
        y: 30,
        scale: "1.05",
        duration: 0.6,
        ease: "bounce.out",
      });
      ratingButtons.style.display = "flex";
    } else {
      gsap.to(assistantInfo, {
        opacity: 0,
        height: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          assistantInfo.style.display = "none";
          ratingButtons.style.display = "none";
          gsap.fromTo(
            card,
            { y: 0 },
            {
              y: -20,
              duration: 0.2,
              scale: "1",
              ease: "power2.out",
              onComplete: () => {
                gsap.to(card, {
                  y: 0,
                  duration: 0.1,
                  ease: "elastic.out(1.2,0.75)",
                });
              },
            },
          );
        },
      });
    }
  };

  // Yeh function bhi change karo
  function checkMessageCountAndToggleAssistantInfo() {
    try {
      const raw = localStorage.getItem(CHAT_MESSAGES_KEY) || "[]";
      const messages = JSON.parse(raw);
      const messageCount = messages.length;

      // YEH LINE CHANGE KARO: 5 se 3 kar do
      if (messageCount >= 3) {
        if (!isAssistantInfoShown) {
          const assistantInfo = document.getElementById("assistantInfo");
          const ratingButtons = document.getElementById("ratingButtons");
          if (assistantInfo) assistantInfo.style.display = "block";
          if (ratingButtons) ratingButtons.style.display = "flex";
          isAssistantInfoShown = true;
        }
      } else {
        if (isAssistantInfoShown) {
          const assistantInfo = document.getElementById("assistantInfo");
          const ratingButtons = document.getElementById("ratingButtons");
          if (assistantInfo) assistantInfo.style.display = "none";
          if (ratingButtons) ratingButtons.style.display = "none";
          isAssistantInfoShown = false;
        }
      }
    } catch (error) {
      console.error("Error checking message count:", error);
    }
  }

  window.toggleEmojiPicker = function () {
    const picker = document.getElementById("emojiPicker");
    if (!picker) return;
    picker.style.display = picker.style.display === "flex" ? "none" : "flex";
  };

  window.addEmoji = function (emoji) {
    if (!elements.chatInput) return;
    const start =
      elements.chatInput.selectionStart || elements.chatInput.value.length;
    const end =
      elements.chatInput.selectionEnd || elements.chatInput.value.length;
    const value = elements.chatInput.value;
    elements.chatInput.value = value.slice(0, start) + emoji + value.slice(end);
    const pos = start + emoji.length;
    elements.chatInput.focus();
    elements.chatInput.setSelectionRange(pos, pos);

    const picker = document.getElementById("emojiPicker");
    if (picker) picker.style.display = "none";
  };

  window.openCloseConfirm = function () {
    const overlay = document.getElementById("closeOverlay");
    if (overlay) overlay.style.display = "flex";
  };

  window.hideCloseConfirm = function () {
    const overlay = document.getElementById("closeOverlay");
    if (overlay) overlay.style.display = "none";
  };

  window.confirmCloseChat = function () {
    hideCloseConfirm();
    closeFullChat();
  };

  window.openEmailSubscription = function () {
    const overlay = document.getElementById("emailSubscriptionOverlay");
    const menu = document.getElementById("moreMenu");
    if (overlay) {
      overlay.style.display = "flex";
      // Add show class for animation
      setTimeout(() => {
        overlay.classList.add("show");
      }, 10);
    }
    if (menu) menu.classList.remove("show");
  };

  window.hideEmailSubscription = function () {
    const overlay = document.getElementById("emailSubscriptionOverlay");
    const form = document.getElementById("emailSubscriptionForm");
    if (overlay) {
      overlay.classList.remove("show");
      setTimeout(() => {
        overlay.style.display = "none";
      }, 300);
    }
    if (form) form.reset();
  };

  window.handleEmailSubscription = function (event) {
    event.preventDefault();
    const emailInput = document.getElementById("emailInput");
    const email = emailInput?.value.trim();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    // Email basic validation
    if (!email.includes('@') || !email.includes('.')) {
      alert("Please enter a valid email address.");
      return;
    }

    console.log("Attempting to send email:", email); // Debug log

    let userextract = email.split("@");
    let username = userextract[0];

    // Pehle API call, phir localStorage
    fetch('http://127.0.0.1:8000/api/subscribe', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors', // Explicitly set mode
      body: JSON.stringify({
        name: username,
        email: email,
        plan: "premium"
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {

        // Ab localStorage mein save karo
        const subs = JSON.parse(localStorage.getItem("email_subscriptions") || "[]");
        if (!subs.includes(email)) {
          subs.push(email);
          localStorage.setItem("email_subscriptions", JSON.stringify(subs));
        }

        alert("Thank you! You've been subscribed to our email updates.");
      })
      .catch(error => {
        console.error("Full error:", error);
        alert("Could not connect to server. Please check your connection or try again later.");
      });
  };

  // === Feedback Modal Functions ===

  window.openFeedbackModal = function (type = "positive") {
    const overlay = document.getElementById("feedbackOverlay");
    const menu = document.getElementById("moreMenu");

    if (overlay) {
      // Reset form
      document.getElementById("feedbackForm").reset();
      document.getElementById("feedbackText").value = "";
      document.getElementById("feedbackType").value = type;

      // Remove active class from all buttons
      document.querySelectorAll(".feedback-type-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Set active button based on type
      const activeBtn = document.querySelector(
        `.feedback-type-btn[data-type="${type}"]`,
      );
      if (activeBtn) {
        activeBtn.classList.add("active");
      }

      // Update UI based on type
      const icon = document.getElementById("feedbackIcon");
      const title = document.getElementById("feedbackTitle");
      const description = document.getElementById("feedbackDescription");

      switch (type) {
        case "positive":
          icon.className = "fa-solid fa-thumbs-up";
          title.textContent = "Positive Feedback";
          description.textContent = "What did you like about our service?";
          break;
        case "negative":
          icon.className = "fa-solid fa-thumbs-down";
          title.textContent = "Negative Feedback";
          description.textContent = "What can we improve?";
          break;
        case "suggestion":
          icon.className = "fa-solid fa-lightbulb";
          title.textContent = "Share Your Suggestion";
          description.textContent = "We'd love to hear your ideas!";
          break;
      }

      overlay.style.display = "flex";
      // Add show class for animation
      setTimeout(() => {
        overlay.classList.add("show");
      }, 10);
    }

    if (menu) menu.classList.remove("show");
  };

  window.hideFeedbackModal = function () {
    const overlay = document.getElementById("feedbackOverlay");
    const form = document.getElementById("feedbackForm");
    if (overlay) {
      overlay.classList.remove("show");
      setTimeout(() => {
        overlay.style.display = "none";
        if (form) form.reset();
        // Reset to default state
        document.querySelectorAll(".feedback-type-btn").forEach((btn) => {
          btn.classList.remove("active");
        });
        document.getElementById("feedbackType").value = "";
      }, 300);
    }
  };

  window.handleFeedbackSubmit = function (event) {
    event.preventDefault();
    const feedbackType = document.getElementById("feedbackType").value;
    const feedbackText = document.getElementById("feedbackText").value.trim();

    if (!feedbackType) {
      alert("Please select a feedback type.");
      return;
    }

    if (!feedbackText) {
      alert("Please enter your feedback.");
      return;
    }

    try {
      // Get existing feedback or create new array
      const raw = localStorage.getItem(USER_FEEDBACK_KEY) || "[]";
      const feedback = JSON.parse(raw);

      // Add new feedback
      feedback.push({
        type: feedbackType,
        text: feedbackText,
        timestamp: new Date().toISOString(),
      });

      // Save back to localStorage
      localStorage.setItem(USER_FEEDBACK_KEY, JSON.stringify(feedback));

      // Show success message
      let message = "Thank you for your feedback!";
      if (feedbackType === "positive") {
        message =
          "🎉 Thank you for your positive feedback! We're glad you had a good experience.";
      } else if (feedbackType === "negative") {
        message =
          "🙏 Thank you for your honest feedback. We'll use this to improve our service.";
      } else if (feedbackType === "suggestion") {
        message =
          "💡 Thank you for your suggestion! We'll consider it for future improvements.";
      }

      alert(message);
      window.hideFeedbackModal();

      // Reset header rating buttons to default state
      const upBtn = document.querySelector(
        "#ratingButtons button:first-child i",
      );
      const downBtn = document.querySelector(
        "#ratingButtons button:last-child i",
      );
      if (upBtn && downBtn) {
        upBtn.classList.remove("fa-solid");
        upBtn.classList.add("fa-regular");
        downBtn.classList.remove("fa-solid");
        downBtn.classList.add("fa-regular");
      }
    } catch (e) {
      console.error("Failed to save feedback", e);
      alert("Something went wrong. Please try again.");
    }
  };

  function handleSoundToggle() {
    const toggle = document.getElementById("soundToggle");
    if (!toggle) return;
    const enabled = toggle.checked;
    setSoundEnabled(enabled);
    if (enabled) {
      playNotificationSound();
    }
  }

  function updateSoundUI() {
    const soundIcon = document.getElementById("soundIcon");
    const soundText = document.getElementById("soundText");
    const toggle = document.getElementById("soundToggle");
    const enabled = isSoundEnabled();

    if (soundIcon) {
      soundIcon.className = enabled
        ? "fa-solid fa-volume-high"
        : "fa-solid fa-volume-xmark";
    }
    if (soundText) {
      soundText.textContent = "Sound";
    }
    if (toggle) {
      toggle.checked = enabled;
    }
  }

  window.handlePlusClick = function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      "video/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    input.multiple = true;

    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      const preview = document.getElementById("inputPreview");

      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        const previewItem = createElement("div", {
          className: "file-preview-item",
        });

        const removeBtn = createElement(
          "div",
          {
            className: "remove-btn",
            onclick: (e) => {
              e.stopPropagation();
              previewItem.remove();
              if (preview.children.length === 0) {
                updateTextareaLayout();
              }
            },
          },
          ["×"],
        );

        previewItem.appendChild(removeBtn);

        if (file.type.startsWith("image/")) {
          const img = createElement("img", { src: url });
          previewItem.appendChild(img);
        } else if (file.type.startsWith("video/")) {
          const vid = createElement("video", {
            src: url,
            muted: true,
            autoplay: true,
            loop: true,
          });
          previewItem.appendChild(vid);
        } else {
          const iconContainer = createElement("div", {
            className: "file-icon",
          });
          let iconClass = "fa-solid fa-file";
          let iconColor = "#6c757d";

          if (file.type === "application/pdf") {
            iconClass = "fa-solid fa-file-pdf";
            iconColor = "#dc3545";
          } else if (file.type.includes("word")) {
            iconClass = "fa-solid fa-file-word";
            iconColor = "#0d6efd";
          }

          const icon = createElement("i", {
            className: iconClass,
            style: { color: iconColor, fontSize: "14px" },
          });
          iconContainer.appendChild(icon);
          previewItem.appendChild(iconContainer);
        }

        previewItem.onclick = () => window.open(url, "_blank");
        preview.appendChild(previewItem);
      });

      updateTextareaLayout();
    };

    input.click();
  };

  function updateTextareaLayout() {
    const preview = document.getElementById("inputPreview");
    const chatInput = document.getElementById("chatInput");

    if (!preview || !chatInput) return;

    if (preview.children.length > 0) {
      const previewRect = preview.getBoundingClientRect();
      if (previewRect.height > 40) {
        chatInput.style.marginTop = "0";
        chatInput.style.width = "100%";
      } else {
        const previewWidth = preview.offsetWidth;
        chatInput.style.marginTop = "2px";
        chatInput.style.width = `calc(100% - ${previewWidth + 8}px)`;
      }
    } else {
      chatInput.style.width = "100%";
      chatInput.style.marginTop = "2px";
    }
  }

  window.resetChat = function () {
    localStorage.removeItem(CHAT_MESSAGES_KEY);
    if (elements.conversationBody) {
      const welcomeSection =
        elements.conversationBody.querySelector(".chatbox-inline");
      const welcomeInfo =
        elements.conversationBody.querySelector(".welcome-info-box");
      const welcomePills =
        elements.conversationBody.querySelector(".welcome-pills");

      elements.conversationBody.innerHTML = "";
      if (welcomeSection) elements.conversationBody.appendChild(welcomeSection);
      if (welcomeInfo) elements.conversationBody.appendChild(welcomeInfo);
      if (welcomePills) elements.conversationBody.appendChild(welcomePills);

      if (welcomeSection) welcomeSection.style.display = "block";
      elements.conversationBody.scrollTop = 0;
    }

    sessionUserMessages = 0;

    const assistantInfo = document.getElementById("assistantInfo");
    const ratingButtons = document.getElementById("ratingButtons");
    if (assistantInfo) assistantInfo.style.display = "none";
    if (ratingButtons) ratingButtons.style.display = "none";
    isAssistantInfoShown = false;
  };

  // === Helper Functions ===

  function hideAllChatViews() {
    if (elements.chatPage) elements.chatPage.style.display = "none";
    if (elements.fullChat) elements.fullChat.style.display = "none";
  }

  function saveChatState(state) {
    localStorage.setItem(CHAT_STATE_KEY, state);
  }

  function setMinimized(isMin) {
    localStorage.setItem(CHAT_MIN_KEY, isMin ? "1" : "0");
  }

  function closeFullChat() {
    if (elements.fullChat) {
      elements.fullChat.classList.remove("show");
      setTimeout(() => {
        hideAllChatViews();
        localStorage.removeItem(CHAT_STATE_KEY);
        setMinimized(true);
      }, 300);
    }
  }

  function initWelcomePills() {
    const pillsContainer = document.querySelector(".welcome-pills");
    const chatInput = document.getElementById("chatInput");

    if (!pillsContainer || !chatInput) return;

    pillsContainer.addEventListener("click", function (e) {
      if (e.target.tagName === "BUTTON") {
        const text = e.target.innerText.trim();
        chatInput.value = text;
        chatInput.focus();
        chatInput.style.height = "auto";
        chatInput.style.height = chatInput.scrollHeight + "px";
      }
    });
  }

  // === Initialize on DOM Load ===

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    setTimeout(initializeApp, 100);
  }
  function initializeApp() {
    try {
      initializeChat();
    } catch (error) {
      console.error("❌ Failed to initialize chat widget:", error);
    }
  }

  // Close more menu when clicking outside
  // Page load par chalao
  document.addEventListener("DOMContentLoaded", function () {
    // Assistant info ko hide karo
    const assistantInfo = document.getElementById("assistantInfo");
    const ratingButtons = document.getElementById("ratingButtons");

    if (assistantInfo) assistantInfo.style.display = "none";
    if (ratingButtons) ratingButtons.style.display = "none";

    // Phir check karo ke 3 messages hain ya nahi
    checkMessageCountAndToggleAssistantInfo();
  });

  // Handle window resize
  window.addEventListener("resize", updateTextareaLayout);

  // Export functions to global scope
  window.ChatWidget = {
    openProductExpert,
    minimizeChat,
    openFullChat,
    sendMessage,
    resetChat,
    openFeedbackModal,
    hideFeedbackModal,
    handleFeedbackSubmit,
  };
})();
