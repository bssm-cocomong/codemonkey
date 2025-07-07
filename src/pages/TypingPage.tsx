import { useEffect, useState } from "react";
import styled from "styled-components";
import { useTypingStore } from "../stores/typingStore";
import type { TypingMode, ProgrammingLanguage } from "../types/index";
import { useAllCodeFormats, useCodeFormats } from '../hooks/useCodeFormats'
import { useCodeTokens } from '../hooks/useCodeTokens'
import { supabase } from "../utils/supabase";

const Container = styled.div`
    padding: 20px 102px;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const Header = styled.h1`
    color: #3a7fa7;
    font-size: 36px;
    margin-bottom: 30px;
    margin-top: 0;
`;

const OptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
    gap: 15px;
`;

const ModeBox = styled.div`
    display: flex;
    gap: 20px;
    padding: 10px 36px;
    border-radius: 50px;
    background: #f4f4f4;
    align-items: center;
`;

const ModeButton = styled.button<{ isActive: boolean }>`
    background: transparent;
    color: ${(props) => (props.isActive ? "#3A7FA7" : "#999")};
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: ${(props) => (props.isActive ? "bold" : "normal")};
`;

const Divider = styled.div`
    width: 1px;
    height: 20px;
    background-color: #ddd;
`;

const LanguageSelector = styled.select`
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    color: #3a7fa7;
`;

const ContentContainer = styled.div`
    display: flex;
    gap: 40px;
    flex: 1;
    min-height: 0;
`;

const CodeDisplay = styled.pre`
    flex: 1;
    background: transparent;
    padding: 20px;
    border-radius: 8px;
    font-size: 20px;
    color: #333;
    line-height: 1.6;
    overflow-y: auto;
    max-height: 60vh;
    font-family: "Galmuri11", monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
`;

const CharSpan = styled.span<{
    status: "correct" | "incorrect" | "current" | "remaining";
}>`
    background-color: ${(props) => {
        if (props.status === "correct") return "#d4edda";
        if (props.status === "incorrect") return "#f8d7da";
        if (props.status === "current") return "#fff3cd";
        return "transparent";
    }};
    color: ${(props) => {
        if (props.status === "correct") return "#155724";
        if (props.status === "incorrect") return "#721c24";
        if (props.status === "current") return "#856404";
        return "#333";
    }};
`;

const InputArea = styled.textarea`
    flex: 1;
    padding: 20px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    font-family: "Galmuri11", monospace;
    resize: none;
    outline: none;
    max-height: 45vh;

    &:focus {
        border-color: #3a7fa7;
    }
`;

// 완료 인터페이스 스타일들 - 전체 화면 오버레이
const CompletionOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.5s ease-out;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const CompletionCard = styled.div`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 60px;
    text-align: center;
    animation: slideUp 0.6s ease-out;
    max-width: 600px;
    width: 90%;

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const CelebrationTitle = styled.h2`
font-size: 36px;
margin-bottom: 10px;
color: #fff;
`;

const CelebrationSubtitle = styled.p`
font-size: 16px;
margin-bottom: 30px;
opacity: 0.9;
`;

const StatsGrid = styled.div`
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 20px;
width: 100%;
max-width: 400px;
margin: 0 auto 30px auto;
`;

const StatCard = styled.div`
background: rgba(255, 255, 255, 0.1);
border-radius: 8px;
padding: 20px;
text-align: center;
`;

const StatValue = styled.div`
font-size: 24px;
font-weight: bold;
margin-bottom: 5px;
`;

const StatLabel = styled.div`
font-size: 14px;
opacity: 0.8;
`;

const MotivationMessage = styled.p`
font-size: 16px;
margin-bottom: 30px;
padding: 15px;
background: rgba(255, 255, 255, 0.1);
border-radius: 8px;
font-style: italic;
`;

const ActionButtons = styled.div`
display: flex;
gap: 15px;
flex-wrap: wrap;
justify-content: center;
`;

const ActionButton = styled.button<{ variant?: "primary" | "secondary" }>`
padding: 12px 24px;
border: none;
border-radius: 6px;
font-size: 14px;
cursor: pointer;
transition: all 0.2s ease;

${(props) =>
props.variant === "primary"
? `
background: #fff;
color: #3A7FA7;
font-weight: bold;
`
: `
background: rgba(255, 255, 255, 0.2);
color: white;
border: 1px solid rgba(255, 255, 255, 0.3);
`}

&:hover {
transform: translateY(-2px);
}
`;

const StatsContainer = styled.div`
    display: flex;
    gap: 30px;
    margin-bottom: 20px;
    justify-content: center;
`;

const StatItem = styled.div`
    font-size: 16px;
    color: #666;
`;

const TypingPage = () => {
    const { currentSession, startSession, updateUserInput, resetSession } =
        useTypingStore();
    const [selectedMode, setSelectedMode] = useState<TypingMode>("line");
    const [selectedLanguage, setSelectedLanguage] =
        useState<ProgrammingLanguage>("Python");
    const [text, setText] = useState<string>("Sample text");
    const [category, setCategory] = useState<string>("method");

    const { data: formats, isLoading: loadingFormats } = useCodeFormats(selectedLanguage, category)
    const { data: allFormats, isLoading: loadingAllFormats } = useAllCodeFormats(selectedLanguage)
    const { data: tokens, isLoading: loadingTokens } = useCodeTokens(selectedLanguage)

    // if (loadingFormats || loadingTokens) {
    //     return <div>Loading...</div>;
    // }

    const handleModeChange = (mode: TypingMode) => {
        setSelectedMode(mode);
        setCategory(mode);
        resetSession(); // 모드 변경 시 세션 리셋
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const language = e.target.value as ProgrammingLanguage;
        setSelectedLanguage(language);
        resetSession(); // 언어 변경 시 세션 리셋
    };

    const randomTokenByType = (tokens: any[] | undefined, type: string) => {
        if (!tokens) return 0

        const filtered = tokens.filter(token => token.type === type);
        if (filtered.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * filtered.length);
        return filtered[randomIndex];
    };

    useEffect(() => {
        if (category == "all") {
            if (allFormats && allFormats.length > 0 && selectedLanguage) {

                let full = "";
                for (let i = 0; i < 20; i++) {
                    const randomIndex = Math.floor(Math.random() * allFormats.length)
                    const randomItem = allFormats[randomIndex]
                    
                    const type = randomTokenByType(tokens, 'type');
                    const method = randomTokenByType(tokens, 'method');
                    const value = randomTokenByType(tokens, 'value');
                    const varname = randomTokenByType(tokens, 'varname');

                    const text = randomItem.format_str
                    const replacements = {
                        "<type>": type.value,
                        "<method>": method.value,
                        "<value>": value.value,
                        "<varname>": varname.value,
                    };
                    const result = text.replace(/<[^>]+>/g, (match: string) => (replacements as any)[match] || match);
                    full = full + result + "\n";
                }
                setText(full);
                startSession(selectedMode, selectedLanguage, full);
            }
        }
        else if (formats && formats.length > 0 && selectedLanguage) {
            let full = "";
            for (let i = 0; i < 20; i++) {
                const randomIndex = Math.floor(Math.random() * formats.length)
                const randomItem = formats[randomIndex]

                const type = randomTokenByType(tokens, 'type');
                const method = randomTokenByType(tokens, 'method');
                const value = randomTokenByType(tokens, 'value');
                const varname = randomTokenByType(tokens, 'varname');

                const text = randomItem.format_str
                const replacements = {
                    "<type>": type.value,
                    "<method>": method.value,
                    "<value>": value.value,
                    "<varname>": varname.value,
                };
                const result = text.replace(/<[^>]+>/g, (match: string) => (replacements as any)[match] || match);
                full = full + result + "\n";
            }
            setText(full);
            startSession(selectedMode, selectedLanguage, full);
        }
    }, [formats, selectedLanguage, selectedMode, selectedLanguage, category])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (newValue.length <= currentSession!.text.length) {
            updateUserInput(newValue);
        }
    };

    const handleKeyDown = (_e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 필요시 키보드 제한 로직 추가
        // 예: 백스페이스 제한
        // if (_e.key === 'Backspace') {
        //     _e.preventDefault();
        // }
    };

    // 실시간 피드백을 위한 코드 렌더링 함수
    const renderCodeWithHighlight = () => {
        if (!currentSession) return "";

        const { text, userInput } = currentSession;
        const chars = text.split("");

        return chars.map((char, index) => {
            if (char === '\n') {
                return <br key={index} />;
            }

            let status: "correct" | "incorrect" | "current" | "remaining";

            if (index < userInput.length) {
                status = userInput[index] === char ? "correct" : "incorrect";
            } else if (index === userInput.length) {
                status = "current";
            } else {
                status = "remaining";
            }

            return (
                <CharSpan key={index} status={status}>
                    {char}
                </CharSpan>
            );
        });
    };

    // 격려 메시지 생성 함수
    const getMotivationMessage = (wpm: number, accuracy: number) => {
        if (accuracy === 100) {
            return "완벽해요! 🎉 오타 없이 완주하셨네요!";
        } else if (accuracy >= 95) {
            return "훌륭해요! 👏 거의 완벽한 실력이에요!";
        } else if (accuracy >= 90) {
            return "잘하셨어요! 💪 조금만 더 연습하면 완벽해질 거예요!";
        } else if (accuracy >= 80) {
            return "좋은 시작이에요! 🌟 꾸준히 연습해보세요!";
        } else {
            return "연습이 실력을 만들어요! 🚀 다시 도전해보세요!";
        }
    };

    // 소요 시간 계산 함수
    const getElapsedTime = () => {
        if (!currentSession?.startTime || !currentSession?.endTime) return 0;
        return Math.round(
            (currentSession.endTime.getTime() -
                currentSession.startTime.getTime()) /
                1000
        );
    };

    // 다른 모드 추천 함수
    const getNextModeRecommendation = () => {
        const modes: TypingMode[] = [
            "keyword",
            "line",
            "variable",
            "function",
            "method",
            "all",
        ];
        const currentIndex = modes.indexOf(selectedMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        return modes[nextIndex];
    };

    const handleNextMode = () => {
        const nextMode = getNextModeRecommendation();
        handleModeChange(nextMode);
    };

    // 자동 시작
    // if (!currentSession) {
    //     const text =
    //         formats?.[0]?.format_str;
    //     startSession(selectedMode, selectedLanguage, text);
    // }

    return (
        <Container>
            <Header>CodeMonkey</Header>

            <OptionsContainer>
                <ModeBox>
                    <ModeButton
                        isActive={selectedMode === "keyword"}
                        onClick={() => handleModeChange("keyword")}
                    >
                        키워드
                    </ModeButton>
                    <ModeButton
                        isActive={selectedMode === "line"}
                        onClick={() => handleModeChange("line")}
                    >
                        줄
                    </ModeButton>

                    <Divider />

                    <ModeButton
                        isActive={selectedMode === "variable"}
                        onClick={() => handleModeChange("variable")}
                    >
                        Xy 변수
                    </ModeButton>
                    <ModeButton
                        isActive={selectedMode === "function"}
                        onClick={() => handleModeChange("function")}
                    >
                        f 함수
                    </ModeButton>
                    <ModeButton
                        isActive={selectedMode === "method"}
                        onClick={() => handleModeChange("method")}
                    >
                        m 메서드
                    </ModeButton>
                    <ModeButton
                        isActive={selectedMode === "all"}
                        onClick={() => handleModeChange("all")}
                    >
                        all 모두
                    </ModeButton>
                </ModeBox>

                <LanguageSelector
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                >
                    <option value="Python">Python</option>
                    <option value="C">C</option>
                    <option value="Java">Java</option>
                </LanguageSelector>
            </OptionsContainer>

            {currentSession && (
                <>
                    <StatsContainer>
                        <StatItem>WPM: {currentSession.wpm}</StatItem>
                        <StatItem>정확도: {currentSession.accuracy}%</StatItem>
                        <StatItem>
                            진행률: {currentSession.currentPosition}/
                            {currentSession.text.length}
                        </StatItem>
                    </StatsContainer>

                    <ContentContainer>
                        <CodeDisplay>{renderCodeWithHighlight()}</CodeDisplay>
                        <InputArea
                            value={currentSession.userInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="여기에 입력하세요..."
                            autoFocus
                        />
                    </ContentContainer>
                </>
            )}

            {/* 완료 시 전체 화면 오버레이 */}
            {currentSession?.isCompleted && (
                <CompletionOverlay>
                    <CompletionCard>
                        <CelebrationTitle>축하합니다! 🎉</CelebrationTitle>
                        <CelebrationSubtitle>
                            코드 타이핑을 완료하셨습니다!
                        </CelebrationSubtitle>

                        <StatsGrid>
                            <StatCard>
                                <StatValue>{currentSession.wpm}</StatValue>
                                <StatLabel>WPM</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatValue>
                                    {currentSession.accuracy}%
                                </StatValue>
                                <StatLabel>정확도</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatValue>{getElapsedTime()}초</StatValue>
                                <StatLabel>소요 시간</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatValue>{currentSession.errors}</StatValue>
                                <StatLabel>오타 수</StatLabel>
                            </StatCard>
                        </StatsGrid>

                        <MotivationMessage>
                            {getMotivationMessage(
                                currentSession.wpm,
                                currentSession.accuracy
                            )}
                        </MotivationMessage>

                        <ActionButtons>
                            <ActionButton
                                variant="primary"
                                onClick={resetSession}
                            >
                                다시 도전
                            </ActionButton>
                            <ActionButton
                                variant="secondary"
                                onClick={handleNextMode}
                            >
                                다른 모드 도전
                            </ActionButton>
                        </ActionButtons>
                    </CompletionCard>
                </CompletionOverlay>
            )}
        </Container>
    );
};

export default TypingPage;
