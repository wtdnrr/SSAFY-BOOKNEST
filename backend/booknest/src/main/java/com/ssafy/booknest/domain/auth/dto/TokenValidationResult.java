package com.ssafy.booknest.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenValidationResult {
    private final boolean isValid;
    private final TokenError error;
}
