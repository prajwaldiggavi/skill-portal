package com.skillportal.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * High-precision performance monitoring filter.
 * Measures HTTP request execution latency, attaches the X-Response-Time-Millis header,
 * and warns in server logs when any endpoint exceeds 150ms.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PerformanceMonitoringFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(PerformanceMonitoringFilter.class);
    private static final long SLOW_ENDPOINT_THRESHOLD_MS = 150L;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            if (!response.isCommitted()) {
                response.setHeader("X-Response-Time-Millis", String.valueOf(duration));
            }
            String uri = request.getRequestURI();
            String method = request.getMethod();
            if (duration > SLOW_ENDPOINT_THRESHOLD_MS) {
                log.warn("[PERF_ALERT] Slow Endpoint: {} {} took {}ms (threshold: {}ms)", method, uri, duration, SLOW_ENDPOINT_THRESHOLD_MS);
            } else if (log.isDebugEnabled()) {
                log.debug("[PERF] {} {} took {}ms", method, uri, duration);
            }
        }
    }
}
