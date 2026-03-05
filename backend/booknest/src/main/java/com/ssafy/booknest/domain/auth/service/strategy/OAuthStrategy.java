package com.ssafy.booknest.domain.auth.service.strategy;

import com.ssafy.booknest.domain.auth.dto.OAuthUserInfo;

import java.io.IOException;

public interface OAuthStrategy {
    OAuthUserInfo getUserInfo(String code) throws IOException;

}
