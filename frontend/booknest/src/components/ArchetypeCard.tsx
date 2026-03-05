import React from 'react';
import styled from '@emotion/styled';
import canaryImage from '../assets/images/archetype/canary.png';
import sparrowImage from '../assets/images/archetype/sparrow.png';
import albatrossImage from '../assets/images/archetype/albatross.png';
import eagleImage from '../assets/images/archetype/eagle.png';
import longtailImage from '../assets/images/archetype/longtail.png';
import owlImage from '../assets/images/archetype/owl.png';
import ravenImage from '../assets/images/archetype/raven.png';
import flamingoImage from '../assets/images/archetype/flamingo.png';

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #FFFDF7;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Image = styled.img`
  width: 150px;
  height: 150px;
  object-fit: contain;
  display: block;
  border-radius: 16px;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ArchetypeTitle = styled.h3`
  color: #102C57;
  font-size: 1.3rem;
  margin: 0;
`;

const ArchetypeDescription = styled.div`
  color: #333;
  font-size: 1rem;
  font-style: italic;
  line-height: 1.5;
`;

const ArchetypeAuthor = styled.div`
  color: #666;
  font-size: 0.9rem;
  text-align: right;
  margin-top: 8px;
`;

interface ArchetypeCardProps {
  archetype?: string;
}

// Define archetype information mapping
const archetypeData = {
  "카나리아": {
    image: canaryImage,
    title: "독창적 실험가 카나리아",
    quote: "이 문장을 읽는 순간, 당신은 나의 독자가 된다. 그러므로 나는 당신을 창조할 수 있다.",
    author: "— 이탈로 칼비노, 『어느 겨울밤 한 여행자가』"
  },
  "알바트로스": {
    image: albatrossImage,
    title: "세계관 탐험가 알바트로스",
    quote: "길을 나서지 않으면 결코 알 수 없다. 세상은 너무나도 넓으니까.",
    author: "— J.R.R. 톨킨, 『반지의 제왕』"
  },
  "독수리": {
    image: eagleImage,
    title: "현실주의자 독수리",
    quote: "글쎄요, 난 이곳에서 당신들이 누리는 그런 거짓된 가짜 행복을 느끼기보다는 차라리 불행해지고 싶은데요.",
    author: "— 올더스 헉슬리, 『멋진 신세계』"
  },
  "흰 오목눈이": {
    image: longtailImage,
    title: "따뜻한 감성가 흰 오목눈이",
    quote: "네가 사랑하는 것은 너를 울게 한다. 하지만 결국 너를 가장 강하게 만드는 것도 그것이다.",
    author: "— 빅토르 위고, 『노트르담 드 파리』"
  },
  "부엉이": {
    image: owlImage,
    title: "논리적 사색가 부엉이",
    quote: "진정으로 아는 사람은 자기가 모른다는 것을 아는 사람이다.",
    author: "— 소크라테스, 『소크라테스의 변론』"
  },
  "까마귀": {
    image: ravenImage,
    title: "냉철한 분석가 까마귀",
    quote: "진실은 종종 가장 보이지 않는 곳에 숨겨져 있다.",
    author: "— 아서 코난 도일, 『셜록 홈즈』 시리즈"
  },
  "앵무새": {
    image: longtailImage,
    title: "명랑한 이야기꾼 앵무새",
    quote: "약간의 어리석음은 괜찮아. 우리는 모두 조금씩 이상하니까.",
    author: "— 루이스 캐럴, 『이상한 나라의 앨리스』"
  },
  "플라밍고": {
    image: flamingoImage,
    title: "감각의 여정자 플라밍고",
    quote: "이 광대한 우주 무한한 시간 속에서 당신과 같은 시간, 같은 행성 위에 살아가는 것을 기뻐하며",
    author: "— 칼 세이건, 『코스모스』"
  }
};

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ archetype }) => {
  // If archetype is null/undefined, show the sparrow card
  if (!archetype) {
    return (
      <CardContainer>
        <Image src={sparrowImage} alt="참새 아키타입" />
        <ContentContainer>
          <ArchetypeTitle>아키타입을 분석 중입니다</ArchetypeTitle>
          <ArchetypeDescription>
            "독서를 통해 알아가는 당신의 아키타입"
          </ArchetypeDescription>
        </ContentContainer>
      </CardContainer>
    );
  }
  
  // Check if archetype exists in our mapping
  const archetypeInfo = archetypeData[archetype];
  
  // If we have data for this archetype, show it
  if (archetypeInfo) {
    return (
      <CardContainer>
        <Image src={archetypeInfo.image} alt={`${archetype} 아키타입`} />
        <ContentContainer>
          <ArchetypeTitle>{archetypeInfo.title}</ArchetypeTitle>
          <ArchetypeDescription>
            "{archetypeInfo.quote}"
          </ArchetypeDescription>
          <ArchetypeAuthor>{archetypeInfo.author}</ArchetypeAuthor>
        </ContentContainer>
      </CardContainer>
    );
  }
  
  // For archetypes not in our mapping, show sparrow as fallback
  return (
    <CardContainer>
      <Image src={sparrowImage} alt={`${archetype} 아키타입`} />
      <ContentContainer>
        <ArchetypeTitle>{archetype}</ArchetypeTitle>
        <ArchetypeDescription>
          "독서를 통해 알아가는 당신의 아키타입"
        </ArchetypeDescription>
      </ContentContainer>
    </CardContainer>
  );
};

export default ArchetypeCard; 