package com.ssafy.booknest.domain.search.record;

import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Builder
@Document(indexName = "users")
public record SerachedUser(
        @Id
        Integer id,

        @Field(type = FieldType.Keyword)
        String nickname,

        @Field(type = FieldType.Keyword, name = "profile_url")
        String profileURL
) {
    public static SerachedUser fromAnotherSource(final SerachedUser user) {
        return SerachedUser.builder()
                .id(user.id())
                .nickname(user.nickname())
                .profileURL(user.profileURL())
                .build();
    }
}
