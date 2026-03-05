package com.ssafy.booknest.domain.book.dto.response;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookPurchaseResponse {
    private String aladinUrl;
    private String kyoboUrl;
    private String yes24Url;
}
