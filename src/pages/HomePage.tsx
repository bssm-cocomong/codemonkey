import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
    margin-top: 248px;
    margin-left: 102px;
`;

const Title = styled.h1`
    color: #3a7fa7;
    font-size: 56px;
`;

const Subtitle = styled.p`
    font-size: 32px;
`;

const StartButton = styled(Link)`
    display: inline-block;
    margin-top: 100px;
    padding: 22px 16px;
    background-color: #f4f4f4;
    color: #3a7fa7;
    font-size: 24px;
    text-decoration: none;
    border-radius: 16px;
`;

const HomePage = () => {
    return (
        <Container>
            <Title>CodeMonkey</Title>
            <Subtitle>코딩과 함께하는 타자연습</Subtitle>
            <StartButton to="/typing">시작하기</StartButton>
        </Container>
    );
};

export default HomePage;
