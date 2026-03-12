import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column,
} from '@react-email/components';
import * as React from 'react';

/* ============================================================
   Orin Leather — Order Receipt Email Template
   Built with React Email — renders to HTML + plain text.
   Preview at: https://react.email/docs/introduction
   ============================================================ */

interface Props {
    orderId: string;
    amountFormatted: string;
    currency: string;
    shipping: {
        name?: string;
        address?: {
            line1?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
        };
    } | null;
    createdAt: string;
}

const BRAND_COLOR = '#c8a96e';
const DARK_BG = '#0a0a0a';
const SUBTLE = '#888888';
const WHITE = '#ffffff';

export function OrderReceiptEmail({ orderId, amountFormatted, shipping, createdAt }: Props) {
    const date = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <Html>
            <Head />
            <Preview>Your Orin Leather order has been confirmed — {amountFormatted}</Preview>

            <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: 0 }}>
                <Container style={{ maxWidth: '600px', margin: '40px auto', backgroundColor: WHITE, borderRadius: '8px', overflow: 'hidden' }}>

                    {/* Header */}
                    <Section style={{ backgroundColor: DARK_BG, padding: '32px 40px', textAlign: 'center' as const }}>
                        <Text style={{ color: BRAND_COLOR, fontSize: '24px', fontWeight: 700, letterSpacing: '4px', margin: 0 }}>
                            ORIN
                        </Text>
                        <Text style={{ color: SUBTLE, fontSize: '12px', letterSpacing: '2px', margin: '4px 0 0', textTransform: 'uppercase' as const }}>
                            Leather Goods
                        </Text>
                    </Section>

                    {/* Body */}
                    <Section style={{ padding: '40px 40px 24px' }}>
                        <Heading style={{ fontSize: '22px', fontWeight: 700, color: DARK_BG, margin: '0 0 8px' }}>
                            Order Confirmed
                        </Heading>
                        <Text style={{ color: SUBTLE, fontSize: '14px', margin: '0 0 32px' }}>
                            Thank you for your order. We&apos;re preparing your leather goods with care.
                        </Text>

                        {/* Order summary */}
                        <Section style={{ backgroundColor: '#f9f9f9', borderRadius: '6px', padding: '20px 24px', marginBottom: '24px' }}>
                            <Row>
                                <Column>
                                    <Text style={{ color: SUBTLE, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, margin: '0 0 4px' }}>Order ID</Text>
                                    <Text style={{ color: DARK_BG, fontSize: '14px', fontFamily: 'monospace', margin: 0 }}>{orderId}</Text>
                                </Column>
                                <Column style={{ textAlign: 'right' as const }}>
                                    <Text style={{ color: SUBTLE, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, margin: '0 0 4px' }}>Date</Text>
                                    <Text style={{ color: DARK_BG, fontSize: '14px', margin: 0 }}>{date}</Text>
                                </Column>
                            </Row>

                            <Hr style={{ borderColor: '#e5e5e5', margin: '16px 0' }} />

                            <Row>
                                <Column>
                                    <Text style={{ color: SUBTLE, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, margin: '0 0 4px' }}>Total Paid</Text>
                                </Column>
                                <Column style={{ textAlign: 'right' as const }}>
                                    <Text style={{ color: BRAND_COLOR, fontSize: '20px', fontWeight: 700, margin: 0 }}>{amountFormatted}</Text>
                                </Column>
                            </Row>
                        </Section>

                        {/* Shipping */}
                        {shipping?.address && (
                            <Section style={{ marginBottom: '24px' }}>
                                <Text style={{ color: SUBTLE, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, margin: '0 0 8px' }}>Shipping To</Text>
                                <Text style={{ color: DARK_BG, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                                    {shipping.name}<br />
                                    {shipping.address.line1}<br />
                                    {shipping.address.city}, {shipping.address.state} {shipping.address.postal_code}<br />
                                    {shipping.address.country}
                                </Text>
                            </Section>
                        )}

                        <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />

                        <Text style={{ color: SUBTLE, fontSize: '13px', lineHeight: '1.6' }}>
                            Questions? Reply to this email or contact us at{' '}
                            <Link href="mailto:support@orinleather.com" style={{ color: BRAND_COLOR }}>
                                support@orinleather.com
                            </Link>
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={{ backgroundColor: '#f9f9f9', padding: '20px 40px', textAlign: 'center' as const }}>
                        <Text style={{ color: SUBTLE, fontSize: '11px', margin: 0 }}>
                            © {new Date().getFullYear()} Orin Leather — Crafted with care
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

export default OrderReceiptEmail;
