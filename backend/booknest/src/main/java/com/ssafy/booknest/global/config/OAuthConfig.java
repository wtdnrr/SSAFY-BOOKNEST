package com.ssafy.booknest.global.config;

import com.ssafy.booknest.domain.auth.service.strategy.GoogleOAuthStrategy;
import com.ssafy.booknest.domain.auth.service.strategy.KaKaoOAuthStrategy;
import com.ssafy.booknest.domain.auth.service.strategy.NaverOAuthStrategy;
import com.ssafy.booknest.domain.auth.service.strategy.OAuthStrategy;
import com.ssafy.booknest.domain.user.enums.Provider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.EnumMap;
import java.util.Map;

@Configuration
public class OAuthConfig {
    @Bean
    public Map<Provider, OAuthStrategy> oAuthStrategyMap(
            KaKaoOAuthStrategy kakaoStrategy,
            GoogleOAuthStrategy googleStrategy,
            NaverOAuthStrategy naverStrategy
    ) {
        Map<Provider, OAuthStrategy> strategyMap = new EnumMap<>(Provider.class);
        strategyMap.put(Provider.KAKAO, kakaoStrategy);
        strategyMap.put(Provider.GOOGLE, googleStrategy);
        strategyMap.put(Provider.NAVER, naverStrategy);
        return strategyMap;
    }
}
