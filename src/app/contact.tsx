import { useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CustomModal, ModalConfig } from "../components/CustomModal";

const CONTACT_EMAIL = "madhusudhant207@gmail.com";

export default function Contact() {
  const scaleTerms = useRef(new Animated.Value(1));
  const scalerndm = useRef(new Animated.Value(1));
  const scaleSend = useRef(new Animated.Value(1));

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const bounce = (ref: React.RefObject<Animated.Value>) => {
    Animated.sequence([
      Animated.timing(ref.current, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.timing(ref.current, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const exitApp = () => {
    if (Platform.OS === "android") { BackHandler.exitApp(); return; }
    showModal({ title: "Exit", message: "Close the app from the app switcher.", buttons: [{ text: "OK", style: "cancel" }] });
  };

  const showPrivacyAlert = () => {
    showModal({
      title: "Terms & Conditions",
      message: `PRIVACY AND COPYRIGHT POLICIES(scroll below to view copyright policies)


      
# Privacy Policy & Terms of Use
**Last Updated:** July 20, 2026
By using this App, you agree to this Privacy Policy and Terms of Use.

# 2. Information We Collect

Depending on how you use the App, we may collect:

### Account Information

* Username
* Email address (if provided)
* Profile picture
* User ID

### AI Conversations

* Messages you send to AI models
* AI-generated responses
* Conversation timestamps
* Api key is also saved in the database as the app requires users to put their own 
* It is safeguarded from abuse

### Device Information

* Device model
* Operating system version
* App version
* Anonymous crash logs
* Diagnostic information

### Usage Information

* Features used
* App performance data
* Error reports
* General analytics

---

# 3. How We Use Your Information

Your information may be used to:

* Provide AI chat functionality.
* Synchronize your account across devices.
* Save your conversation history.
* Improve app performance.
* Fix bugs.
* Prevent abuse and fraud.
* Respond to support requests.
* Develop future features.

---

# 4. AI Providers

The App communicates with third-party AI providers, which may include:

* OpenAI
* NVIDIA
* Meta
* Alibaba
* Mistral AI
* ByteDance
* Google
* Other AI providers added in future updates.

When you send a prompt, your message may be transmitted to the selected AI provider for processing. Each provider has its own Privacy Policy and Terms of Service.

---

# 5. Storage of Your Information

Your account information and chat history may be stored on secure cloud servers.

Reasonable technical and organizational measures are used to help protect your information. However, no online service can guarantee absolute security.

---

# 6. Chat History

Your conversations may be stored so they remain available when you return to the App.

You may delete your conversation history using the available in-app options.

Deleting conversations may permanently remove them from your account.

---

# 7. API Keys

This project is open source.

Users may supply their own API keys.

Developer-provided API keys are intended solely for use within the App.

Attempting to extract, redistribute, automate, abuse, or otherwise use developer-provided API credentials outside their intended purpose is prohibited. Access may be revoked without notice.

---

# 8. User Responsibilities

You agree not to:

* Abuse or interfere with the App.
* Attempt unauthorized access.
* Reverse engineer the backend for malicious purposes.
* Use automated systems to abuse developer resources.
* Upload malicious software.
* Violate applicable laws while using the App.

---

# 9. Intellectual Property

OpenAI, NVIDIA, Meta, Google, ByteDance, Cohere ai, Poolside Ai, Flux Schnell, Stable diffusions and all other company names, product names, logos, and trademarks remain the property of their respective owners.

Their appearance within the App does not imply sponsorship, endorsement, partnership, or affiliation.

---

# 10. Open Source

The App's source code is publicly available.

Open-source availability does not grant permission to misuse developer infrastructure, services, or API credentials.
Key word is misuse
you can edit the code and use it to your liking given that you dont mess with the restricted things such as api credentials

---

# 11. Children's Privacy

This App is not intended for children under 13 years of age (or the minimum age required in your country).

If we become aware that personal information has been collected from a child without appropriate consent, we will take reasonable steps to remove it.
Please do contact us 

---

# 12. Data Retention

We retain information only as long as reasonably necessary to:

* Maintain your account.
* Provide requested services.
* Meet legal obligations.
* Resolve disputes.
* Enforce these Terms.

---

# 13. Data Deletion

You may request deletion of your account and associated data.

Where technically feasible and legally permitted, your information will be deleted from our systems within a reasonable period after your request.

---

# 14. Your Rights

Depending on your location, you may have rights to:

* Access your information.
* Correct inaccurate information.
* Delete your information.
* Request a copy of your information.
* Object to certain processing.
* Withdraw consent where applicable.

---

# 15. Third-Party Services

The App may integrate services such as:

* Supabase
* Expo
* AI model providers
* Analytics providers
* Crash reporting services

Each service maintains its own privacy practices.

---

# 16. Disclaimer

The App is provided "AS IS" and "AS AVAILABLE."

The developer makes no guarantees regarding:

* Accuracy of AI responses.
* Availability.
* Reliability.
* Fitness for a particular purpose.

AI responses may be incorrect, incomplete, offensive, or outdated. Users should independently verify important information.

The App should not be used as a substitute for professional medical, legal, financial, engineering, or other expert advice.

---

# 17. Limitation of Liability

To the maximum extent permitted by law, the developer shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:

* Use of the App.
* Inability to use the App.
* AI-generated content.
* Data loss.
* Service interruptions.
* Third-party services.

---

# 18. Changes to This Policy

This Privacy Policy may be updated from time to time.

The latest version will always be available within the App.

Continued use of the App after changes become effective constitutes acceptance of the revised policy.

---

# 19. Contact

Questions regarding this Privacy Policy may be directed to the developer using the contact information provided in the App or the project's official repository.

---

By creating an account or using this App, you acknowledge that you have read, understood, and agreed to this Privacy Policy and Terms of Use.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
 
AS OF JUNE 17TH 2026 

COPYRIGHT POLICIES
Creative Commons Legal Code

CC0 1.0 Universal

    CREATIVE COMMONS CORPORATION IS NOT A LAW FIRM AND DOES NOT PROVIDE
    LEGAL SERVICES. DISTRIBUTION OF THIS DOCUMENT DOES NOT CREATE AN
    ATTORNEY-CLIENT RELATIONSHIP. CREATIVE COMMONS PROVIDES THIS
    INFORMATION ON AN "AS-IS" BASIS. CREATIVE COMMONS MAKES NO WARRANTIES
    REGARDING THE USE OF THIS DOCUMENT OR THE INFORMATION OR WORKS
    PROVIDED HEREUNDER, AND DISCLAIMS LIABILITY FOR DAMAGES RESULTING FROM
    THE USE OF THIS DOCUMENT OR THE INFORMATION OR WORKS PROVIDED
    HEREUNDER.

Statement of Purpose

The laws of most jurisdictions throughout the world automatically confer
exclusive Copyright and Related Rights (defined below) upon the creator
and subsequent owner(s) (each and all, an "owner") of an original work of
authorship and/or a database (each, a "Work").

Certain owners wish to permanently relinquish those rights to a Work for
the purpose of contributing to a commons of creative, cultural and
scientific works ("Commons") that the public can reliably and without fear
of later claims of infringement build upon, modify, incorporate in other
works, reuse and redistribute as freely as possible in any form whatsoever
and for any purposes, including without limitation commercial purposes.
These owners may contribute to the Commons to promote the ideal of a free
culture and the further production of creative, cultural and scientific
works, or to gain reputation or greater distribution for their Work in
part through the use and efforts of others.

For these and/or other purposes and motivations, and without any
expectation of additional consideration or compensation, the person
associating CC0 with a Work (the "Affirmer"), to the extent that he or she
is an owner of Copyright and Related Rights in the Work, voluntarily
elects to apply CC0 to the Work and publicly distribute the Work under its
terms, with knowledge of his or her Copyright and Related Rights in the
Work and the meaning and intended legal effect of CC0 on those rights.

1. Copyright and Related Rights. A Work made available under CC0 may be
protected by copyright and related or neighboring rights ("Copyright and
Related Rights"). Copyright and Related Rights include, but are not
limited to, the following:

  i. the right to reproduce, adapt, distribute, perform, display,
     communicate, and translate a Work;
 ii. moral rights retained by the original author(s) and/or performer(s);
iii. publicity and privacy rights pertaining to a person's image or
     likeness depicted in a Work;
 iv. rights protecting against unfair competition in regards to a Work,
     subject to the limitations in paragraph 4(a), below;
  v. rights protecting the extraction, dissemination, use and reuse of data
     in a Work;
 vi. database rights (such as those arising under Directive 96/9/EC of the
     European Parliament and of the Council of 11 March 1996 on the legal
     protection of databases, and under any national implementation
     thereof, including any amended or successor version of such
     directive); and
vii. other similar, equivalent or corresponding rights throughout the
     world based on applicable law or treaty, and any national
     implementations thereof.

2. Waiver. To the greatest extent permitted by, but not in contravention
of, applicable law, Affirmer hereby overtly, fully, permanently,
irrevocably and unconditionally waives, abandons, and surrenders all of
Affirmer's Copyright and Related Rights and associated claims and causes
of action, whether now known or unknown (including existing as well as
future claims and causes of action), in the Work (i) in all territories
worldwide, (ii) for the maximum duration provided by applicable law or
treaty (including future time extensions), (iii) in any current or future
medium and for any number of copies, and (iv) for any purpose whatsoever,
including without limitation commercial, advertising or promotional
purposes (the "Waiver"). Affirmer makes the Waiver for the benefit of each
member of the public at large and to the detriment of Affirmer's heirs and
successors, fully intending that such Waiver shall not be subject to
revocation, rescission, cancellation, termination, or any other legal or
equitable action to disrupt the quiet enjoyment of the Work by the public
as contemplated by Affirmer's express Statement of Purpose.

3. Public License Fallback. Should any part of the Waiver for any reason
be judged legally invalid or ineffective under applicable law, then the
Waiver shall be preserved to the maximum extent permitted taking into
account Affirmer's express Statement of Purpose. In addition, to the
extent the Waiver is so judged Affirmer hereby grants to each affected
person a royalty-free, non transferable, non sublicensable, non exclusive,
irrevocable and unconditional license to exercise Affirmer's Copyright and
Related Rights in the Work (i) in all territories worldwide, (ii) for the
maximum duration provided by applicable law or treaty (including future
time extensions), (iii) in any current or future medium and for any number
of copies, and (iv) for any purpose whatsoever, including without
limitation commercial, advertising or promotional purposes (the
"License"). The License shall be deemed effective as of the date CC0 was
applied by Affirmer to the Work. Should any part of the License for any
reason be judged legally invalid or ineffective under applicable law, such
partial invalidity or ineffectiveness shall not invalidate the remainder
of the License, and in such case Affirmer hereby affirms that he or she
will not (i) exercise any of his or her remaining Copyright and Related
Rights in the Work or (ii) assert any associated claims and causes of
action with respect to the Work, in either case contrary to Affirmer's
express Statement of Purpose.

4. Limitations and Disclaimers.

 a. No trademark or patent rights held by Affirmer are waived, abandoned,
    surrendered, licensed or otherwise affected by this document.
 b. Affirmer offers the Work as-is and makes no representations or
    warranties of any kind concerning the Work, express, implied,
    statutory or otherwise, including without limitation warranties of
    title, merchantability, fitness for a particular purpose, non
    infringement, or the absence of latent or other defects, accuracy, or
    the present or absence of errors, whether or not discoverable, all to
    the greatest extent permissible under applicable law.
 c. Affirmer disclaims responsibility for clearing rights of other persons
    that may apply to the Work or any use thereof, including without
    limitation any person's Copyright and Related Rights in the Work.
    Further, Affirmer disclaims responsibility for obtaining any necessary
    consents, permissions or other rights required for any use of the
    Work.
 d. Affirmer understands and acknowledges that Creative Commons is not a
    party to this document and has no duty or obligation with respect to
    this CC0 or use of the Work.

`,
      buttons: [
        { text: "Disagree", style: "danger", onPress: () => showModal({ title: "Access Denied", message: "You must accept the terms to continue.", buttons: [{ text: "Exit", style: "danger", onPress: exitApp }, { text: "Back" }] }) },
        { text: "Agree", onPress: () => showModal({ title: "Accepted", message: "You have agreed to the Terms and Conditions.", buttons: [{ text: "Continue" }] }) },
        // { text: "Copyright Policy", onPress: () => Linking.openURL("https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/LICENSE") },
        // { text: "Privacy Policy", onPress: () => Linking.openURL("https://github.com/madhusudhan-rgb/TSX-proj/blob/MAIN2/PRIVACY%20POLICY") },
      ],
    });
  };

  const handleSend = async () => {
    bounce(scaleSend);
    const trimmed = message.trim();
    if (!trimmed) {
      showModal({ title: "Empty Message", message: "Write something before sending.", buttons: [{ text: "OK", style: "cancel" }] });
      return;
    }
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("App Inquiry")}&body=${encodeURIComponent(trimmed)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      showModal({ title: "No Email App", message: `No email app found.\n\n${CONTACT_EMAIL}`, buttons: [{ text: "OK", style: "cancel" }] });
      return;
    }
    await Linking.openURL(url);
    setMessage("");
    showModal({ title: "Done", message: "Your email app is open. Hit send!", buttons: [{ text: "OK" }] });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <CustomModal visible={modalVisible} config={modalConfig} onClose={() => setModalVisible(false)} />

      {/* Page title */}
      <Text style={styles.pageTitle}>Contact</Text>

      {/* Email tap row */}
      <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
        <View style={styles.emailRow}>
          <View>
            <Text style={styles.emailLabel}>Email</Text>
            <Text style={styles.emailValue}>{CONTACT_EMAIL}</Text>
          </View>
          <Text style={styles.emailArrow}>↗</Text>
        </View>
      </Pressable>

      <View style={styles.hr} />

      {/* Message box */}
      <Text style={styles.formLabel}>Send feedback or contact for inquiries</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholder="What's on your mind?"
        placeholderTextColor="#444"
        multiline
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <Pressable onPress={handleSend}>
        <Animated.View style={[styles.sendBtn, { transform: [{ scale: scaleSend.current }] }]}>
          <Text style={styles.sendBtnText}>Send</Text>
        </Animated.View>
      </Pressable>

      <View style={styles.hr} />

      {/* Bottom links */}
      <View style={styles.links}>
        {[
          { ref: scaleTerms, label: "Terms & Conditions", onPress: () => { bounce(scaleTerms); showPrivacyAlert(); } },
          {
            ref: scalerndm, label: "Resources", onPress: () => {
              bounce(scalerndm);
              showModal({ title: "Resources", message: "N/A", buttons: [{ text: "OK", style: "cancel" }] });
            }
          },
        ].map(({ ref, label, onPress }) => (
          <Pressable key={label} onPress={onPress}>
            <Animated.View style={{ transform: [{ scale: ref.current }] }}>
              <Text style={styles.linkText}>{label}</Text>
            </Animated.View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  content: { padding: 24, paddingTop: 64 },

  pageTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 32,
    letterSpacing: -0.5,
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  emailLabel: { color: "#555", fontSize: 12, marginBottom: 4, fontWeight: "600" },
  emailValue: { color: "#fff", fontSize: 16, fontWeight: "500" },
  emailArrow: { color: "#555", fontSize: 20 },

  hr: { height: 1, backgroundColor: "#222", marginVertical: 28 },

  formLabel: { color: "#555", fontSize: 12, fontWeight: "600", marginBottom: 12 },
  input: {
    backgroundColor: "#181818",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
    padding: 14,
    color: "#fff",
    fontSize: 15,
    minHeight: 140,
    lineHeight: 22,
    marginBottom: 12,
  },
  inputFocused: { borderColor: "#333" },

  sendBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendBtnText: { color: "#111", fontWeight: "700", fontSize: 15 },

  links: { gap: 20 },
  linkText: { color: "#555", fontSize: 14, fontWeight: "500" },
});