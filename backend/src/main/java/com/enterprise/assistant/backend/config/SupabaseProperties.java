
package com.enterprise.assistant.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.supabase")
public class SupabaseProperties {

    private String url;
    private String secretKey;
    private Storage storage = new Storage();

    @Getter
    @Setter
    public static class Storage {
        private String bucket = "knowledge-base";
    }
}
