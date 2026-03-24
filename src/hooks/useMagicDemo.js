import { useState, useEffect, useCallback } from 'react';

/**
 * useMagicDemo
 * Provides automated demo capabilities for Req2Test AI.
 * Triggered by 3 clicks on the sidebar logo.
 */
export const useMagicDemo = (setScreen, setSourceText) => {
  const [demoActive, setDemoActive] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const typeText = async (targetId, text, speed = 30, append = false) => {
    const element = document.getElementById(targetId);
    if (!element) return;

    if (!append) element.value = '';
    const initialText = element.value;

    for (let i = 0; i < text.length; i++) {
        const currentText = initialText + text.slice(0, i + 1);
        element.value = currentText;
        // Trigger React's onChange
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
        
        // Only update source text if it's the main textarea
        if (targetId === 'manual-input-textarea' && setSourceText) {
            setSourceText(currentText);
        }

        await new Promise(r => setTimeout(r, speed + Math.random() * 20));
    }
  };

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const waitUntil = async (predicate, timeout = 30000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (predicate()) return true;
      await wait(500);
    }
    return false;
  };

  const clickElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
        el.click();
        return true;
    }
    return false;
  };

  const runDemo = useCallback(async () => {
    if (demoActive) return;
    setDemoActive(true);
    console.log("🚀 Magic Demo Started!");

    try {
        // Step 1: Ensure we are on Upload Screen
        setScreen('upload');
        await wait(1000);

        // Step 2: Type sample requirements
        const sampleText = "1. 로그인 화면에서 비밀번호 찾기 기능을 제공한다.\n2. 사용자가 이메일을 입력하고 전송 버튼을 누르면 인증 링크가 발송된다.\n3. 발송된 링크는 30분 동안 유효하며, 1회만 사용 가능하다.\n4. 가입되지 않은 이메일인 경우 '존재하지 않는 계정입니다'라는 에러 메시지를 표시한다.";
        await typeText('manual-input-textarea', sampleText);
        await wait(1000);

        // Step 3: Analyze
        clickElement('analyze-text-btn');
        await wait(1000);

        // Wait for AnalysisScreen to mount and start analyzing
        await waitUntil(() => !!document.querySelector('[data-status]'));
        
        // Step 4: Wait for analysis to complete (data-status="analyzed")
        console.log("...Waiting for analysis completion");
        await waitUntil(() => {
          const el = document.querySelector('[data-status]');
          return el && el.getAttribute('data-status') === 'analyzed';
        }, 15000);
        await wait(2000);

        // Step 4.2: Clicking through all analysis queue items
        console.log("...Clicking through analysis queue items");
        const queueItems = document.querySelectorAll('.analysis-queue-item');
        const detailScroll = document.getElementById('analysis-detail-scroll');
        for (let i = 0; i < queueItems.length; i++) {
          queueItems[i].click();
          if (detailScroll) {
            detailScroll.scrollTo({ top: 0, behavior: 'instant' });
            // Small scroll after selection to show focus
            await wait(300);
            detailScroll.scrollTo({ top: 150, behavior: 'smooth' });
          }
          await wait(1000);
        }
        await wait(1000);

        // Step 4.5: Approve the last or first item
        console.log("...Approving a requirement");
        clickElement('approve-req-btn');
        await wait(1500);

        // Step 5: Finalize to TC
        clickElement('finalize-tc-btn');
        
        // Handle potential confirm dialog
        const originalConfirm = window.confirm;
        window.confirm = () => true; 
        await wait(500);
        window.confirm = originalConfirm;

        // Step 6: Wait for TC Screen to mount
        await waitUntil(() => !!document.querySelector('[data-is-generating]'));

        // Step 7: Wait for TC generation to complete (data-is-generating="false")
        console.log("...Waiting for TC generation to complete");
        await waitUntil(() => {
          const el = document.querySelector('[data-is-generating]');
          return el && el.getAttribute('data-is-generating') === 'false';
        }, 15000);
        await wait(2000); // Visual pause

        // Step 8: Randomly select few TCs and edit one
        console.log("...Interacting with TC list");
        const tcItems = document.querySelectorAll('.tc-queue-item');
        if (tcItems.length > 0) {
            // Click 2nd and then 3rd to show selection change
            if (tcItems[1]) { tcItems[1].click(); await wait(1000); }
            if (tcItems[2]) { tcItems[2].click(); await wait(1000); }
            
            // Edit the expected result of the selected one
            console.log("...Editing expected result");
            await typeText('tc-expected-result-textarea', " (추가 검증: 이메일 발송 로그에 'PW_RESET' 태그가 포함되어야 함)", 20, true);
            await wait(1500);
        }

        // Scroll through TCs to showcase
        const tcQueue = document.getElementById('tc-queue-container');
        if (tcQueue) {
            tcQueue.scrollTo({ top: 400, behavior: 'smooth' });
            await wait(1500);
            tcQueue.scrollTo({ top: 0, behavior: 'smooth' });
            await wait(1000);
        }

        console.log("✅ Demo Sequence Completed");
    } catch (error) {
        console.error("❌ Demo Error:", error);
    } finally {
        setDemoActive(false);
        setClickCount(0);
    }
  }, [demoActive, setScreen, setSourceText]);

  useEffect(() => {
    const logo = document.getElementById('sidebar-logo');
    if (!logo) return;

    const handleClick = () => {
      setClickCount(prev => {
        const next = prev + 1;
        if (next >= 3) {
            runDemo();
            return 0;
        }
        return next;
      });
    };

    logo.addEventListener('click', handleClick);
    
    // Auto-reset click count if no click for a while
    const resetTimer = setTimeout(() => {
      if (clickCount > 0) setClickCount(0);
    }, 2000);

    return () => {
      logo.removeEventListener('click', handleClick);
      clearTimeout(resetTimer);
    };
  }, [runDemo, clickCount]);

  return { demoActive };
};
